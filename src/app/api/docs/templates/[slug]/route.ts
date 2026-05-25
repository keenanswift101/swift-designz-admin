import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import TemplatePDF from "@/components/documents/TemplatePDF";
import EstoreRetainerPDF from "@/components/documents/EstoreRetainerPDF";
import { getTemplateContent } from "@/lib/document-content-registry";
import { getDocumentTemplatesForRole } from "@/lib/document-templates";
import { DEFAULT_ESTORE_RETAINER, type EstoreRetainerContent } from "@/types/estore-retainer";
import type { UserRole } from "@/types/database";
import fs from "fs";
import path from "path";

function loadLogoBase64(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "favicon.png");
    const buf = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const searchParams = new URL(request.url).searchParams;
  const preview = searchParams.get("preview") === "true";
  const embed = searchParams.get("embed") === "true";

  /* ── Auth ──────────────────────────────── */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "viewer") as UserRole;

  /* ── Access check ─────────────────────── */
  const allowed = getDocumentTemplatesForRole(role);
  const template = allowed.find((t) => t.slug === slug);
  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  /* ── Content lookup ───────────────────── */
  const doc = getTemplateContent(slug);
  if (!doc) {
    return NextResponse.json({ error: "PDF not available for this template" }, { status: 404 });
  }

  /* ── Render PDF ───────────────────────── */
  const logoSrc = loadLogoBase64();

  let buffer: Buffer;
  let filename: string;

  if (slug === "estore-retainer") {
    const { data: override } = await supabase
      .from("document_overrides")
      .select("content")
      .eq("slug", "estore-retainer")
      .single();
    const content: EstoreRetainerContent = (override?.content as EstoreRetainerContent) ?? DEFAULT_ESTORE_RETAINER;
    buffer = await renderToBuffer(EstoreRetainerPDF({ logoSrc, content }));
    filename = `eStore-Retainer-Agreement-${content.ref}`;
  } else {
    buffer = await renderToBuffer(TemplatePDF({ doc, logoSrc }));
    filename = `${template.label.replace(/\s+/g, "-")}-${doc.ref}`;
  }

  /* ── Embed mode: return an HTML shell that loads the PDF via <object>.
       Browser sub-resource requests (object/embed) ignore Content-Disposition,
       so the PDF always renders inline — no download prompt. ── */
  if (embed) {
    const pdfUrl = `/api/docs/templates/${slug}?preview=true`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden}</style></head><body><object data="${pdfUrl}" type="application/pdf" width="100%" height="100%" style="display:block"></object></body></html>`;
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": preview
        ? `inline; filename="${filename}.pdf"`
        : `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
