import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import TempContractPDF from "@/components/documents/TempContractPDF";
import type { EmployeeContractRecord } from "@/types/employee-contract";
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

  const { data: contract, error } = await supabase
    .from("employee_contracts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !contract) return new Response("Not found", { status: 404 });

  const r = contract as EmployeeContractRecord;
  const logoSrc = loadLogoBase64();
  const buffer = await renderToBuffer(TempContractPDF({ logoSrc, content: r.content }));
  const filename = `${r.name.replace(/\s+/g, "-")}-${r.content.ref}.pdf`;

  if (embed) {
    const pdfUrl = `/api/docs/employee-contracts/${id}?preview=true`;
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
