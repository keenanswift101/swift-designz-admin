"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendReminderEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

// ── Approve Reminder ──────────────────────────────────────────────────────────

export async function approveReminderAction(reminderId: string): Promise<{ error: string } | { ok: true }> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_reminders")
    .update({ status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", reminderId)
    .eq("status", "pending");

  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/reminders");
  revalidatePath("/invoices");
  return { ok: true };
}

// ── Send Reminder ─────────────────────────────────────────────────────────────

export async function sendReminderAction(reminderId: string): Promise<{ error: string } | { ok: true }> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: reminder } = await supabase
    .from("payment_reminders")
    .select(`
      *,
      invoices(
        id, invoice_number, amount, paid_amount, due_date,
        payment_plan_enabled, payment_plan_schedule, quotation_id,
        clients(name, email, company)
      )
    `)
    .eq("id", reminderId)
    .single();

  if (!reminder) return { error: "Reminder not found." };
  if (reminder.status === "sent") return { error: "Already sent." };
  if (reminder.status === "dismissed") return { error: "Reminder has been dismissed." };

  const invoice = reminder.invoices as {
    id: string;
    invoice_number: string;
    amount: number;
    paid_amount: number;
    due_date: string;
    payment_plan_enabled: boolean;
    payment_plan_schedule: { amount_cents?: number; amount?: number }[] | null;
    quotation_id: string | null;
    clients: { name: string; email: string; company: string | null } | null;
  } | null;

  if (!invoice) return { error: "Invoice not found." };
  const client = invoice.clients;
  if (!client?.email) return { error: "Client has no email address." };

  // Compute outstanding — for payment plan invoices, use plan total minus all paid installments
  let outstanding = invoice.amount - invoice.paid_amount;
  if (invoice.payment_plan_enabled && invoice.quotation_id) {
    const { data: planInvoices } = await supabase
      .from("invoices")
      .select("paid_amount, payment_plan_schedule")
      .eq("quotation_id", invoice.quotation_id);

    if (planInvoices && planInvoices.length > 0) {
      type S = { amount_cents?: number; amount?: number };
      const totalPaid = planInvoices.reduce((s, inv) => s + (inv.paid_amount as number), 0);
      const firstWithSched = planInvoices.find((inv) => inv.payment_plan_schedule);
      const planTotal = firstWithSched
        ? ((firstWithSched.payment_plan_schedule as S[]) ?? []).reduce(
            (s, it) => s + (it.amount_cents ?? it.amount ?? 0),
            0,
          )
        : invoice.amount;
      outstanding = Math.max(0, planTotal - totalPaid);
    }
  }

  // Don't send if invoice is already fully paid
  if (outstanding <= 0) {
    await supabase
      .from("payment_reminders")
      .update({ status: "dismissed" })
      .eq("id", reminderId);
    revalidatePath("/accounts-receivable/reminders");
    revalidatePath("/invoices");
    return { error: "Invoice is already paid — reminder auto-dismissed." };
  }

  // Generate WhatsApp message for stages 3 & 4 using actual due date
  let whatsappMessage: string | null = null;
  if (reminder.stage >= 3) {
    const dueDate = new Date(invoice.due_date);
    const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / 86400000);
    const daysLabel = daysOverdue > 0 ? `${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue` : reminder.stage_label;
    whatsappMessage = `Hi ${client.name},\n\nI hope you're well. I wanted to follow up regarding invoice ${invoice.invoice_number} for ${formatCurrency(outstanding)}, which is now ${daysLabel}.\n\nPlease let me know when we can expect payment or if you'd like to discuss any concerns.\n\nKind regards,\nSwift Designz`;
  }

  const { error: emailErr } = await sendReminderEmail({
    to: client.email,
    clientName: client.name,
    invoiceNumber: invoice.invoice_number,
    outstanding,
    dueDate: invoice.due_date,
    stage: reminder.stage,
    stageLabel: reminder.stage_label ?? `Stage ${reminder.stage}`,
    emailSubject: reminder.email_subject,
  });

  if (emailErr) {
    return { error: "Failed to send reminder email. Please try again." };
  }

  const now = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from("payment_reminders")
    .update({
      status: "sent",
      sent_at: now,
      approved_by: user.id,
      approved_at: reminder.approved_at ?? now,
      whatsapp_message: whatsappMessage,
    })
    .eq("id", reminderId);

  if (updateErr) return { error: updateErr.message };

  revalidatePath("/accounts-receivable/reminders");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath("/invoices");
  return { ok: true };
}

// ── Dismiss Reminder ──────────────────────────────────────────────────────────

export async function dismissReminderAction(reminderId: string): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_reminders")
    .update({ status: "dismissed" })
    .eq("id", reminderId)
    .in("status", ["pending", "approved"]); // can't dismiss already-sent reminders

  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/reminders");
  revalidatePath("/invoices");
  return { ok: true };
}
