import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import EquipmentListPDF from "@/components/equipment/EquipmentListPDF";
import type { EquipmentPDFItem } from "@/components/equipment/EquipmentListPDF";
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

function formatDate(d: Date): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export async function GET() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await authClient
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "viewer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { data: raw, error } = await supabase
    .from("equipment")
    .select("id,name,category,brand,model,serial_number,condition,purchased_at,purchase_price,current_value,status,notes")
    .eq("status", "active")
    .order("category")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (raw ?? []) as EquipmentPDFItem[];
  const logoSrc = loadLogoBase64();
  const generatedDate = formatDate(new Date());

  const buffer = await renderToBuffer(
    EquipmentListPDF({ items, logoSrc, generatedDate })
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="SD-Equipment-Register-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
