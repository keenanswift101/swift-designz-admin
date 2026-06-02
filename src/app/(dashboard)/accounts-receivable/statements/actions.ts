"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { sendStatementEmail } from "@/lib/email";
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

// ── Generate Statement ────────────────────────────────────────────────────────

export async function generateStatementAction(formData: FormData): Promise<{ error: string } | { statementId: string }> {
  const user = await requireAuth();
  const supabase = await createClient();

  const clientId = formData.get("client_id") as string;
  const periodFrom = formData.get("period_from") as string;
  const periodTo = formData.get("period_to") as string;
  const periodType = (formData.get("period_type") as string) || "custom";
  const triggerType = (formData.get("trigger_type") as string) || "manual";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!clientId || !periodFrom || !periodTo) return { error: "Client and date range are required." };

  // Fetch ALL real invoices for this client up to the period end (exclude quotations)
  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount, paid_amount, status, created_at")
    .eq("client_id", clientId)
    .neq("doc_type", "quotation")
    .lte("created_at", periodTo + "T23:59:59");

  const allRows = invoices ?? [];

  // Opening balance = total outstanding on invoices created BEFORE the period start
  const prePeriod = allRows.filter((i) => i.created_at < periodFrom);
  const openingBalance = prePeriod.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0);

  // In-period invoices
  const inPeriod = allRows.filter((i) => i.created_at >= periodFrom);
  const totalInvoiced = inPeriod.reduce((s, i) => s + i.amount, 0);
  const totalPaid = inPeriod.reduce((s, i) => s + i.paid_amount, 0);

  // Closing balance = all outstanding across all invoices up to period end
  const closingBalance = allRows.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0);

  const { data: stmtNumber } = await supabase.rpc("generate_ar_number", { p_type: "statement" });

  const { data: stmt, error } = await supabase
    .from("account_statements")
    .insert({
      statement_number: stmtNumber as string,
      client_id: clientId,
      period_type: periodType,
      period_from: periodFrom,
      period_to: periodTo,
      trigger_type: triggerType,
      opening_balance: openingBalance,
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      closing_balance: closingBalance,
      notes,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/statements");
  return { statementId: stmt.id };
}

// ── Send Statement ────────────────────────────────────────────────────────────

export async function sendStatementAction(statementId: string): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = createAdminClient();

  const { data: stmt } = await supabase
    .from("account_statements")
    .select(`
      id, statement_number, period_type, period_from, period_to, trigger_type,
      opening_balance, total_invoiced, total_paid, closing_balance, notes,
      clients(id, name, email, phone, company)
    `)
    .eq("id", statementId)
    .single();

  if (!stmt) return { error: "Statement not found." };

  const client = stmt.clients as unknown as { id: string; name: string; email: string | null; phone: string | null; company: string | null } | null;
  if (!client?.email) return { error: "Client has no email address." };

  const [{ data: invoices }, { data: planInvoices }, { data: bizRaw }] = await Promise.all([
    supabase
      .from("invoices")
      .select("invoice_number, amount, paid_amount, status, created_at, due_date")
      .eq("client_id", client.id)
      .neq("doc_type", "quotation")
      .lte("created_at", stmt.period_to + "T23:59:59")
      .order("created_at", { ascending: true }),
    supabase
      .from("invoices")
      .select("quotation_id, installment_number, payment_plan_type")
      .eq("client_id", client.id)
      .neq("doc_type", "quotation")
      .eq("payment_plan_enabled", true)
      .not("quotation_id", "is", null)
      .not("installment_number", "is", null),
    supabase.from("business_settings").select("*").limit(1).single(),
  ]);

  const biz = bizRaw as BusinessSettings | null;
  const allInvoices = (invoices ?? []) as AccountStatementInvoiceRow[];
  const broughtForward = allInvoices.filter((i) => i.created_at < stmt.period_from && i.amount > i.paid_amount);
  const invoicesInPeriod = allInvoices.filter((i) => i.created_at >= stmt.period_from);

  // Recalculate balances live
  const openingBalance = broughtForward.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0);
  const totalInvoiced = invoicesInPeriod.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoicesInPeriod.reduce((s, i) => s + i.paid_amount, 0);
  const closingBalance = allInvoices.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0);

  // Scheduled installments from quotation payment plans
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

  const scheduledTotal = scheduledInstallments.reduce((s, i) => s + i.amount, 0);
  const generatedAt = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
  const logoSrc = loadLogoBase64();

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
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
        clientName: client.name,
        clientCompany: client.company ?? null,
        clientEmail: client.email,
        clientPhone: client.phone ?? null,
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
    return { error: `PDF generation failed: ${String(err)}` };
  }

  try {
    await sendStatementEmail({
      to: client.email,
      clientName: client.name,
      statementNumber: stmt.statement_number,
      periodFrom: stmt.period_from,
      periodTo: stmt.period_to,
      openingBalance,
      totalInvoiced,
      totalPaid,
      closingBalance: closingBalance + scheduledTotal,
      pdfBuffer,
    });
  } catch (err) {
    return { error: `Email failed: ${String(err)}` };
  }

  await supabase
    .from("account_statements")
    .update({ sent_at: new Date().toISOString(), sent_to: client.email })
    .eq("id", statementId);

  revalidatePath(`/accounts-receivable/statements/${statementId}`);
  return { ok: true };
}

// ── Delete Statement ──────────────────────────────────────────────────────────

export async function deleteStatementAction(statementId: string): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("account_statements").delete().eq("id", statementId);
  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/statements");
  return { ok: true };
}
