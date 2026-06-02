"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { sendReceiptEmail } from "@/lib/email";

export async function createRetainerSubscriptionAction(
  formData: FormData
): Promise<{ error: string } | { ok: true }> {
  const user = await requireAuth();
  const supabase = await createClient();

  const clientId = formData.get("client_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const monthlyAmount = Math.round(parseFloat(formData.get("monthly_amount") as string) * 100);
  const billingDay = parseInt(formData.get("billing_day") as string, 10);
  const startDate = formData.get("start_date") as string;
  const endDate = (formData.get("end_date") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!clientId || !name || !startDate || isNaN(monthlyAmount) || isNaN(billingDay)) {
    return { error: "Client, name, monthly amount, billing day and start date are required." };
  }

  const { error } = await supabase.from("retainer_subscriptions").insert({
    client_id: clientId,
    name,
    monthly_amount: monthlyAmount,
    billing_day: billingDay,
    start_date: startDate,
    end_date: endDate,
    notes,
    status: "active",
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/retainers");
  return { ok: true };
}

export async function updateRetainerStatusAction(
  id: string,
  status: "active" | "paused" | "cancelled"
): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("retainer_subscriptions")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/retainers");
  return { ok: true };
}

export async function deleteRetainerSubscriptionAction(
  id: string
): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("retainer_subscriptions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/retainers");
  return { ok: true };
}

// ── Record Retainer Payment ───────────────────────────────────────────────────

export async function recordRetainerPaymentAction(
  retainerSubscriptionId: string,
  data: {
    amount: number;         // cents
    paymentMethod: string;
    paymentDate: string;    // YYYY-MM-DD
    reference?: string;
    notes?: string;
  }
): Promise<{ error: string } | { paymentId: string; receiptNumber: string }> {
  const user = await requireAuth();
  const supabase = createAdminClient();

  const { data: receiptNum } = await supabase.rpc("generate_ar_number", { p_type: "receipt" });

  const { data: payment, error } = await supabase
    .from("retainer_payments")
    .insert({
      receipt_number: receiptNum as string,
      retainer_subscription_id: retainerSubscriptionId,
      amount: data.amount,
      payment_method: data.paymentMethod,
      payment_date: data.paymentDate,
      reference: data.reference || null,
      notes: data.notes || null,
      created_by: user.id,
    })
    .select("id, receipt_number")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/retainers");
  revalidatePath("/accounts-receivable/payments");
  return { paymentId: payment.id, receiptNumber: payment.receipt_number as string };
}

// ── Send Retainer Receipt ─────────────────────────────────────────────────────

export async function sendRetainerReceiptAction(
  paymentId: string
): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = createAdminClient();

  const { data: payment } = await supabase
    .from("retainer_payments")
    .select(`
      id, receipt_number, amount, payment_method, payment_date, reference,
      retainer_subscriptions(
        id, name, monthly_amount,
        clients(name, email, company)
      )
    `)
    .eq("id", paymentId)
    .single();

  if (!payment) return { error: "Payment not found." };

  type Sub = { id: string; name: string; monthly_amount: number; clients: { name: string; email: string | null; company: string | null } | null };
  const sub = payment.retainer_subscriptions as unknown as Sub | null;
  const client = sub?.clients ?? null;
  if (!client?.email) return { error: "Client has no email address." };

  try {
    await sendReceiptEmail({
      to: client.email,
      clientName: client.name,
      receiptNumber: payment.receipt_number as string,
      invoiceNumber: sub?.name ?? "Retainer",
      paymentAmount: payment.amount as number,
      paymentMethod: payment.payment_method as string ?? "eft",
      paymentDate: payment.payment_date as string,
      invoiceTotal: sub?.monthly_amount ?? (payment.amount as number),
      balance: 0,
    });
  } catch (err) {
    return { error: `Email failed: ${String(err)}` };
  }

  await supabase
    .from("retainer_payments")
    .update({ sent_at: new Date().toISOString(), sent_to: client.email })
    .eq("id", paymentId);

  revalidatePath("/accounts-receivable/retainers");
  return { ok: true };
}
