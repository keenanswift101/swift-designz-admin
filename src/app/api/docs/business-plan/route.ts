import { renderToBuffer } from "@react-pdf/renderer";
import BusinessPlanPDF from "@/components/documents/BusinessPlanPDF";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const buffer = await renderToBuffer(BusinessPlanPDF());

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Swift-Designz-NYDF-Business-Plan-2026.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
