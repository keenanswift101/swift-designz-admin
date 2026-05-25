import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import EstoreRetainerPDF from "@/components/documents/EstoreRetainerPDF";
import type { RetainerContent } from "@/types/estore-retainer";
import fs from "fs";
import path from "path";

function loadLogoBase64(): string | null {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", "favicon.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = new URL(request.url).searchParams;
  const preview = searchParams.get("preview") === "true";
  const embed = searchParams.get("embed") === "true";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: retainer, error } = await supabase
    .from("retainers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !retainer) return new Response("Not found", { status: 404 });

  const content = retainer.content as RetainerContent;
  const logoSrc = loadLogoBase64();
  const buffer = await renderToBuffer(EstoreRetainerPDF({ logoSrc, content }));
  const filename = `${(content.documentTitle || "Retainer").replace(/\s+/g, "-")}-${content.ref}.pdf`;

  if (embed) {
    const pdfUrl = `/api/docs/retainers/${id}?preview=true`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden}</style></head><body><object data="${pdfUrl}" type="application/pdf" width="100%" height="100%" style="display:block"></object></body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": preview ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
