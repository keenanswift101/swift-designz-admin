import { renderToBuffer } from "@react-pdf/renderer";
import { GenericBusinessPlanPDF } from "@/components/documents/BusinessPlanPDF";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const buffer = await renderToBuffer(GenericBusinessPlanPDF());
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Swift-Designz-Business-Plan-2026.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[generic-business-plan PDF] render error:", err);
    return new Response(String(err), { status: 500 });
  }
}
