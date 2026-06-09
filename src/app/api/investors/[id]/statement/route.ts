import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import InvestorStatementPDF from "@/components/statements/InvestorStatementPDF";
import type { Investor, IncomeEntry } from "@/types/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "viewer" && profile?.role !== "investor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const [year, mon] = month.split("-").map(Number);
  const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
  const endDate = new Date(year, mon, 0).toISOString().split("T")[0];

  const [{ data: investorRaw }, { data: allRaw }, { data: monthRaw }] = await Promise.all([
    supabase.from("investors").select("*").eq("id", id).single(),
    supabase.from("income_entries").select("amount").eq("source", "investor").eq("investor_id", id),
    supabase
      .from("income_entries")
      .select("date, description, amount")
      .eq("source", "investor")
      .eq("investor_id", id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date"),
  ]);

  if (!investorRaw) return NextResponse.json({ error: "Investor not found" }, { status: 404 });

  const investor = investorRaw as Investor;
  const totalContributed = ((allRaw || []) as { amount: number }[]).reduce((s, c) => s + c.amount, 0);
  const contributions = ((monthRaw || []) as Pick<IncomeEntry, "date" | "description" | "amount">[]);
  const monthTotal = contributions.reduce((s, c) => s + c.amount, 0);

  const monthLabel = new Date(year, mon - 1).toLocaleString("en-ZA", { month: "long", year: "numeric" });
  const generatedAt = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

  const buffer = await renderToBuffer(
    InvestorStatementPDF({
      investorName: investor.name,
      investorCompany: investor.company,
      investorEmail: investor.email,
      investorPhone: investor.phone,
      investmentAmount: investor.investment_amount,
      equityPercentage: investor.equity_percentage,
      totalContributed,
      monthTotal,
      contributions,
      monthLabel,
      generatedAt,
    })
  );

  const safeName = investor.name.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Investor-Statement-${safeName}-${month}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
