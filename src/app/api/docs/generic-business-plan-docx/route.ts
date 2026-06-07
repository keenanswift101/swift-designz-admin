import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const filePath = path.join(process.cwd(), "public", "docs", "generic-business-plan.docx");

  if (!fs.existsSync(filePath)) {
    return new Response("Generic business plan document not found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="Swift-Designz-Business-Plan-2026.docx"',
      "Cache-Control": "no-store",
    },
  });
}
