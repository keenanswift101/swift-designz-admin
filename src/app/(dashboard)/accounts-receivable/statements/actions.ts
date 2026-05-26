"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

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

  // Fetch ALL invoices for this client up to the period end (no lower bound — pre-period outstanding becomes opening balance)
  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount, paid_amount, status, created_at")
    .eq("client_id", clientId)
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

// ── Delete Statement ──────────────────────────────────────────────────────────

export async function deleteStatementAction(statementId: string): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("account_statements").delete().eq("id", statementId);
  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/statements");
  return { ok: true };
}
