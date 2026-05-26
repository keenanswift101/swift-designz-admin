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
        clients(name, email, company)
      )
    `)
    .eq("id", reminderId)
    .single();

  if (!reminder) return { error: "Reminder not found." };
  if (reminder.status === "sent") return { error: "Already sent." };

  const invoice = reminder.invoices as {
    id: string; invoice_number: string; amount: number; paid_amount: number; due_date: string;
    clients: { name: string; email: string; company: string | null } | null;
  } | null;

  if (!invoice) return { error: "Invoice not found." };
  const client = invoice.clients;
  if (!client?.email) return { error: "Client has no email address." };

  const outstanding = invoice.amount - invoice.paid_amount;

  // Generate WhatsApp message for stages 3 & 4
  let whatsappMessage: string | null = null;
  if (reminder.stage >= 3) {
    const daysOverdue = reminder.stage === 3 ? 3 : 7;
    whatsappMessage = `Hi ${client.name},\n\nI hope you're well. I wanted to follow up regarding invoice ${invoice.invoice_number} for ${formatCurrency(outstanding)}, which is now ${daysOverdue} days overdue.\n\nPlease let me know when we can expect payment or if you'd like to discuss any concerns.\n\nKind regards,\nSwift Designz`;
  }

  await sendReminderEmail({
    to: client.email,
    clientName: client.name,
    invoiceNumber: invoice.invoice_number,
    outstanding,
    dueDate: invoice.due_date,
    stage: reminder.stage,
    stageLabel: reminder.stage_label,
    emailSubject: reminder.email_subject,
  }).catch(() => {});

  const now = new Date().toISOString();
  await supabase
    .from("payment_reminders")
    .update({
      status: "sent",
      sent_at: now,
      approved_by: user.id,
      approved_at: reminder.approved_at ?? now,
      whatsapp_message: whatsappMessage,
    })
    .eq("id", reminderId);

  revalidatePath("/accounts-receivable/reminders");
  revalidatePath(`/invoices/${invoice.id}`);
  return { ok: true };
}

// ── Dismiss Reminder ──────────────────────────────────────────────────────────

export async function dismissReminderAction(reminderId: string): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_reminders")
    .update({ status: "dismissed" })
    .eq("id", reminderId);

  if (error) return { error: error.message };

  revalidatePath("/accounts-receivable/reminders");
  return { ok: true };
}
