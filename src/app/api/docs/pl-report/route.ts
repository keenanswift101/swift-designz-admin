import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import PLReportPDF from "@/components/accounting/PLReportPDF";
import type { BusinessSettings } from "@/types/database";
import fs from "fs";
import path from "path";

function loadLogoBase64(): string | null {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", "favicon.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch { return null; }
}

function getDateRange(period: string): { from: string; to: string; label: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (period === "mtd") {
    const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    return { from, to: fmt(now), label: now.toLocaleDateString("en-ZA", { month: "long", year: "numeric" }) };
  }
  if (period === "ytd") {
    return { from: `${now.getFullYear()}-01-01`, to: fmt(now), label: `Jan – ${now.toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}` };
  }
  if (period === "prev_financial_year") {
    const fyEndYear = now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
    return { from: `${fyEndYear - 1}-03-01`, to: `${fyEndYear}-02-28`, label: `Mar ${fyEndYear - 1} – Feb ${fyEndYear}` };
  }
  // financial_year (default)
  const fyStartYear = now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
  const fyEnd = new Date(fyStartYear + 1, 1, 28);
  const to = fyEnd < now ? fmt(fyEnd) : fmt(now);
  return { from: `${fyStartYear}-03-01`, to, label: `Mar ${fyStartYear} – ${fyEnd < now ? `Feb ${fyStartYear + 1}` : now.toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}` };
}

export async function GET(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await authClient
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "viewer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "financial_year";
  const { from, to, label } = getDateRange(period);

  const supabase = createAdminClient();

  const [{ data: incomeRaw }, { data: expensesRaw }, { data: bizRaw }] = await Promise.all([
    supabase.from("income_entries").select("amount, category").gte("date", from).lte("date", to),
    supabase.from("expenses").select("amount, category").gte("date", from).lte("date", to),
    supabase.from("business_settings").select("*").limit(1).single(),
  ]);

  const biz = bizRaw as BusinessSettings | null;

  const incomeMap = new Map<string, number>();
  for (const row of incomeRaw ?? []) incomeMap.set(row.category, (incomeMap.get(row.category) ?? 0) + row.amount);
  const income = Array.from(incomeMap.entries()).sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({ category, amount }));

  const expenseMap = new Map<string, number>();
  for (const row of expensesRaw ?? []) expenseMap.set(row.category, (expenseMap.get(row.category) ?? 0) + row.amount);
  const expenses = Array.from(expenseMap.entries()).sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({ category, amount }));

  const generatedAt = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      PLReportPDF({
        periodLabel: label,
        periodFrom: from,
        periodTo: to,
        generatedAt,
        companyName: biz?.company_name ?? "Swift Designz",
        companyAddress: biz?.address ? `${biz.address}${biz.city ? ", " + biz.city : ""}` : null,
        companyVat: biz?.vat_number ?? null,
        companyEmail: biz?.email ?? null,
        logoSrc: loadLogoBase64(),
        income,
        expenses,
      })
    );
  } catch (err) {
    console.error("[PLReport] PDF failed:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  const filename = `SwiftDesignz-PL-${label.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
