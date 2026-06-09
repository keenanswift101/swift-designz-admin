import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import AccountStatementPDF from "@/components/ar/AccountStatementPDF";
import type { AccountStatementInvoiceRow, AccountStatementScheduledRow } from "@/components/ar/AccountStatementPDF";
import type { BusinessSettings } from "@/types/database";
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

const PERIOD_LABELS: Record<string, string> = {
  custom: "Custom Period",
  monthly: "Monthly",
  "30_days": "Last 30 Days",
  financial_year: "Financial Year",
  project: "Project",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await authClient
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "viewer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { data: stmt } = await supabase
    .from("account_statements")
    .select(`
      id, statement_number, period_type, period_from, period_to, trigger_type, notes,
      clients(id, name, email, phone, company)
    `)
    .eq("id", id)
    .single();

  if (!stmt) return NextResponse.json({ error: "Statement not found" }, { status: 404 });

  const client = stmt.clients as unknown as { id: string; name: string; email: string | null; phone: string | null; company: string | null } | null;

  // Fetch invoices and business settings in parallel
  const [{ data: invoices }, { data: planInvoices }, { data: bizRaw }] = await Promise.all([
    supabase
      .from("invoices")
      .select("invoice_number, amount, paid_amount, status, created_at, due_date")
      .eq("client_id", client?.id ?? "")
      .neq("doc_type", "quotation")
      .lte("created_at", stmt.period_to + "T23:59:59")
      .order("created_at", { ascending: true }),
    supabase
      .from("invoices")
      .select("quotation_id, installment_number, payment_plan_type")
      .eq("client_id", client?.id ?? "")
      .neq("doc_type", "quotation")
      .eq("payment_plan_enabled", true)
      .not("quotation_id", "is", null)
      .not("installment_number", "is", null),
    supabase.from("business_settings").select("*").limit(1).single(),
  ]);

  const biz = bizRaw as BusinessSettings | null;
  const allInvoices = (invoices ?? []) as AccountStatementInvoiceRow[];

  const broughtForward = allInvoices.filter(
    (i) => i.created_at < stmt.period_from && i.amount > i.paid_amount
  );
  const invoicesInPeriod = allInvoices.filter((i) => i.created_at >= stmt.period_from);

  // Recalculate balances live (stored values may be stale)
  const openingBalance = broughtForward.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0);
  const totalInvoiced = invoicesInPeriod.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoicesInPeriod.reduce((s, i) => s + i.paid_amount, 0);
  const closingBalance = allInvoices.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0);

  // Compute scheduled installments from quotation payment plans
  const maxInstallByQuotation = new Map<string, number>();
  for (const inv of (planInvoices ?? [])) {
    const key = inv.quotation_id as string;
    const cur = maxInstallByQuotation.get(key) ?? 0;
    if ((inv.installment_number as number) > cur) {
      maxInstallByQuotation.set(key, inv.installment_number as number);
    }
  }

  const scheduledInstallments: AccountStatementScheduledRow[] = [];
  const quotationIds = Array.from(maxInstallByQuotation.keys());
  if (quotationIds.length > 0) {
    const { data: quotations } = await supabase
      .from("quotations")
      .select("id, payment_plan_type, payment_plan_schedule")
      .in("id", quotationIds);

    for (const q of (quotations ?? [])) {
      const maxInvoiced = maxInstallByQuotation.get(q.id) ?? 0;
      const schedule = q.payment_plan_schedule as { label: string; amount_cents?: number; amount?: number; due_date?: string; installment_number?: number }[] | null;
      if (schedule) {
        for (const entry of schedule) {
          if ((entry.installment_number ?? 0) > maxInvoiced) {
            scheduledInstallments.push({
              label: entry.label,
              amount: entry.amount_cents ?? entry.amount ?? 0,
              due_date: entry.due_date ?? null,
              plan_type: q.payment_plan_type as string | null,
            });
          }
        }
      }
    }
  }

  const generatedAt = new Date().toLocaleDateString("en-ZA", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const logoSrc = loadLogoBase64();

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      AccountStatementPDF({
        statementNumber: stmt.statement_number,
        periodType: PERIOD_LABELS[stmt.period_type] ?? stmt.period_type,
        periodFrom: stmt.period_from,
        periodTo: stmt.period_to,
        triggerType: stmt.trigger_type,
        openingBalance,
        totalInvoiced,
        totalPaid,
        closingBalance,
        scheduledInstallments,
        clientName: client?.name ?? "Client",
        clientCompany: client?.company ?? null,
        clientEmail: client?.email ?? null,
        clientPhone: client?.phone ?? null,
        companyName: biz?.company_name ?? "Swift Designz",
        companyAddress: biz?.address ? `${biz.address}${biz.city ? ", " + biz.city : ""}` : null,
        companyPhone: biz?.phone ?? null,
        companyEmail: biz?.email ?? null,
        companyVat: biz?.vat_number ?? null,
        broughtForward,
        invoicesInPeriod,
        notes: stmt.notes ?? null,
        generatedAt,
        logoSrc,
      })
    );
  } catch (err) {
    console.error("[StatementPDF] renderToBuffer failed:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  const safeNum = stmt.statement_number.replace(/[^a-zA-Z0-9-]/g, "-");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeNum}.pdf"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
