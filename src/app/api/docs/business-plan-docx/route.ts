import { generateBusinessPlanDocx } from "@/lib/business-plan-docx";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const buffer = await generateBusinessPlanDocx();
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Swift-Designz-NYDF-Business-Plan-2026.docx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[business-plan DOCX] error:", err);
    return new Response(String(err), { status: 500 });
  }
}
