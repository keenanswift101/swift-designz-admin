"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendQuotationEmail } from "@/lib/email";
import { renderToBuffer } from "@react-pdf/renderer";
import QuotationPDF from "@/components/documents/QuotationPDF";
import type { QuotationLineItem, DiscountType, PaymentPlanInstallment } from "@/types/accounts-receivable";

interface QuotationPayload {
  clientId: string;
  projectId: string | null;
  lineItems: QuotationLineItem[];
  discountType: DiscountType;
  discountValue: number;
  notes: string;
  terms: string;
  paymentPlanEnabled: boolean;
  paymentPlanType: string | null;
  paymentPlanSchedule: PaymentPlanInstallment[] | null;
}

function computeTotals(items: QuotationLineItem[], discountType: DiscountType, discountValue: number) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = Math.round(subtotal * (discountValue / 100));
  } else {
    discountAmount = Math.round(discountValue * 100); // convert rand to cents
  }
  return { subtotal, discountAmount, total: subtotal - discountAmount };
}

export async function createQuotationAction(payload: QuotationPayload): Promise<{ error: string } | { id: string }> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { subtotal, discountAmount, total } = computeTotals(payload.lineItems, payload.discountType, payload.discountValue);

  // Generate AR number via DB function
  const { data: arNum } = await supabase.rpc("generate_ar_number", { p_type: "quotation" });

  const { data: quote, error } = await supabase
    .from("quotations")
    .insert({
      quote_number: arNum as string,
      client_id: payload.clientId,
      project_id: payload.projectId || null,
      status: "draft",
      subtotal,
      discount_type: payload.discountType,
      discount_value: payload.discountValue,
      discount_amount: discountAmount,
      total,
      notes: payload.notes || null,
      terms: payload.terms || null,
      payment_plan_enabled: payload.paymentPlanEnabled,
      payment_plan_type: payload.paymentPlanType || null,
      payment_plan_schedule: payload.paymentPlanSchedule ?? null,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (error || !quote) return { error: error?.message ?? "Failed to create quotation" };

  // Insert line items
  if (payload.lineItems.length > 0) {
    const { error: itemsError } = await supabase.from("quotation_line_items").insert(
      payload.lineItems.map((item, idx) => ({
        quotation_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_rate: item.unit_rate,
        amount: item.amount,
        sort_order: idx,
      }))
    );
    if (itemsError) return { error: itemsError.message };
  }

  revalidatePath("/accounts-receivable/quotations");
  return { id: quote.id };
}

export async function updateQuotationAction(
  id: string,
  payload: QuotationPayload
): Promise<{ error: string } | void> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { subtotal, discountAmount, total } = computeTotals(payload.lineItems, payload.discountType, payload.discountValue);

  const { error } = await supabase.from("quotations").update({
    client_id: payload.clientId,
    project_id: payload.projectId || null,
    subtotal,
    discount_type: payload.discountType,
    discount_value: payload.discountValue,
    discount_amount: discountAmount,
    total,
    notes: payload.notes || null,
    terms: payload.terms || null,
    payment_plan_enabled: payload.paymentPlanEnabled,
    payment_plan_type: payload.paymentPlanType || null,
    payment_plan_schedule: payload.paymentPlanSchedule ?? null,
    updated_by: user.id,
  }).eq("id", id);

  if (error) return { error: error.message };

  // Replace line items
  await supabase.from("quotation_line_items").delete().eq("quotation_id", id);
  if (payload.lineItems.length > 0) {
    const { error: itemsError } = await supabase.from("quotation_line_items").insert(
      payload.lineItems.map((item, idx) => ({
        quotation_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_rate: item.unit_rate,
        amount: item.amount,
        sort_order: idx,
      }))
    );
    if (itemsError) return { error: itemsError.message };
  }

  revalidatePath("/accounts-receivable/quotations");
  revalidatePath(`/accounts-receivable/quotations/${id}`);
}

export async function deleteQuotationAction(id: string): Promise<{ error: string } | void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/accounts-receivable/quotations");
}

export async function sendQuotationAction(id: string): Promise<{ error: string } | void> {
  await requireAdmin();
  const supabase = await createClient();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 10); // 10 calendar days

  const { error } = await supabase.from("quotations").update({
    status: "sent",
    sent_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    locked: true,
  }).eq("id", id).eq("status", "draft");

  if (error) return { error: error.message };

  // Fetch quotation data for email + PDF generation
  const { data: quote } = await supabase
    .from("quotations")
    .select(`
      quote_number, total, subtotal, discount_type, discount_value, discount_amount,
      acceptance_token, notes, terms, payment_plan_enabled, payment_plan_type,
      payment_plan_schedule, created_at,
      clients(name, email, phone, company),
      projects(name),
      quotation_line_items(description, quantity, unit_rate, amount, sort_order)
    `)
    .eq("id", id)
    .single();

  if (quote) {
    const client = quote.clients as unknown as { name: string; email: string; phone: string | null; company: string | null } | null;
    const project = quote.projects as unknown as { name: string } | null;
    const lineItems = (quote.quotation_line_items as { description: string; quantity: number; unit_rate: number; amount: number; sort_order: number }[] ?? [])
      .sort((a, b) => a.sort_order - b.sort_order);

    if (client?.email) {
      // Generate PDF attachment (non-fatal if it fails)
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await renderToBuffer(
          QuotationPDF({
            quoteNumber: quote.quote_number,
            clientName: client.name,
            clientEmail: client.email,
            clientCompany: client.company,
            clientPhone: client.phone,
            projectName: project?.name,
            lineItems,
            subtotal: quote.subtotal,
            discountType: quote.discount_type,
            discountValue: quote.discount_value,
            discountAmount: quote.discount_amount,
            total: quote.total,
            notes: quote.notes,
            terms: quote.terms,
            paymentPlanEnabled: quote.payment_plan_enabled,
            paymentPlanType: quote.payment_plan_type,
            paymentPlanSchedule: quote.payment_plan_schedule as { label: string; amount_cents: number; due_date?: string }[] | null,
            createdAt: quote.created_at,
            expiresAt: expiresAt.toISOString(),
          })
        );
      } catch {
        // PDF generation failure is non-fatal
      }

      await sendQuotationEmail({
        to: client.email,
        clientName: client.name,
        quoteNumber: quote.quote_number,
        total: quote.total,
        expiresAt: expiresAt.toISOString(),
        acceptanceToken: quote.acceptance_token as string,
        lineItems,
        notes: quote.notes,
        pdfBuffer,
      }).catch(() => {
        // Email failure is non-fatal — quotation is already marked sent
      });
    }
  }

  revalidatePath("/accounts-receivable/quotations");
  revalidatePath(`/accounts-receivable/quotations/${id}`);
}

export async function cancelQuotationAction(id: string): Promise<{ error: string } | void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("quotations").update({
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/accounts-receivable/quotations");
  revalidatePath(`/accounts-receivable/quotations/${id}`);
}

export async function convertToInvoiceAction(quotationId: string): Promise<{ error: string } | { invoiceId: string }> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotations")
    .select("*, quotation_line_items(description, quantity, unit_rate, amount, sort_order), clients(name)")
    .eq("id", quotationId)
    .eq("status", "accepted")
    .single();

  if (!quote) return { error: "Quotation not found or not in accepted status." };

  type PlanInstallment = { label: string; amount_cents: number; due_date: string; installment_number: number };
  const schedule = (quote.payment_plan_schedule ?? []) as PlanInstallment[];
  const hasInstallments = quote.payment_plan_enabled && schedule.length > 1;

  // Amount for this invoice: first installment if plan exists, otherwise full total
  const invoiceAmount = hasInstallments ? schedule[0].amount_cents : quote.total;
  const installmentNumber = hasInstallments ? 1 : null;

  // Due date: first installment's due_date if plan exists, otherwise +14 days
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 14);
  const dueDate = hasInstallments && schedule[0].due_date
    ? schedule[0].due_date
    : defaultDue.toISOString().split("T")[0];

  const { data: arNum } = await supabase.rpc("generate_ar_number", { p_type: "invoice" });

  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: arNum as string,
      ar_number: arNum as string,
      client_id: quote.client_id,
      project_id: quote.project_id || null,
      quotation_id: quotationId,
      doc_type: "invoice",
      category: "web_dev",
      amount: invoiceAmount,
      discount_amount: hasInstallments ? 0 : (quote.discount_amount ?? 0),
      discount_type: quote.discount_type,
      status: "sent",
      due_date: dueDate,
      notes: quote.notes || null,
      created_by: user.id,
      payment_plan_enabled: quote.payment_plan_enabled,
      payment_plan_type: quote.payment_plan_type || null,
      payment_plan_schedule: quote.payment_plan_schedule || null,
      installment_number: installmentNumber,
    })
    .select("id")
    .single();

  if (invError || !invoice) return { error: invError?.message ?? "Failed to create invoice." };

  const lineItems = (quote.quotation_line_items as { description: string; quantity: number; unit_rate: number; amount: number; sort_order: number }[])
    .sort((a, b) => a.sort_order - b.sort_order);

  if (lineItems.length > 0) {
    type InsertItem = { invoice_id: string; description: string; quantity: number; unit_rate: number; amount: number; sort_order: number };
    let itemsToInsert: InsertItem[];

    if (!hasInstallments) {
      itemsToInsert = lineItems.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_rate: item.unit_rate,
        amount: item.amount,
        sort_order: item.sort_order,
      }));
    } else {
      // Scale each line item's amount proportionally to the installment slice
      const quoteTotalItems = lineItems.reduce((s, it) => s + it.amount, 0);
      itemsToInsert = lineItems.map((item) => {
        const scaledAmount = quoteTotalItems > 0
          ? Math.round(item.amount * invoiceAmount / quoteTotalItems)
          : Math.round(invoiceAmount / lineItems.length);
        const scaledRate = item.quantity > 0 ? Math.round(scaledAmount / item.quantity) : scaledAmount;
        return {
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_rate: scaledRate,
          amount: scaledAmount,
          sort_order: item.sort_order,
        };
      });
      // Fix any rounding difference so items always sum to exactly invoiceAmount
      const itemsSum = itemsToInsert.reduce((s, it) => s + it.amount, 0);
      const diff = invoiceAmount - itemsSum;
      if (diff !== 0) {
        const last = itemsToInsert[itemsToInsert.length - 1];
        last.amount += diff;
        if (last.quantity > 0) last.unit_rate = Math.round(last.amount / last.quantity);
      }
    }

    const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);
    if (itemsError) return { error: itemsError.message };
  }

  // Schedule notifications for remaining installments
  if (hasInstallments && schedule.length > 1) {
    const clientName = (quote.clients as { name: string } | null)?.name ?? "Client";
    const fmtR = (c: number) => `R${(c / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const remaining = schedule.slice(1);
    await supabase.from("notifications").insert(
      remaining.map((inst) => ({
        type: "installment_due",
        title: `Installment ${inst.installment_number} due — ${clientName}`,
        body: `${inst.label}: ${fmtR(inst.amount_cents)} — send the next invoice for this payment plan.`,
        link: `/invoices/${invoice.id}`,
        scheduled_for: new Date(inst.due_date + "T08:00:00").toISOString(),
      }))
    );
  }

  await supabase.from("quotations").update({
    status: "converted",
    updated_by: user.id,
  }).eq("id", quotationId);

  revalidatePath("/accounts-receivable/quotations");
  revalidatePath(`/accounts-receivable/quotations/${quotationId}`);
  revalidatePath("/invoices");

  return { invoiceId: invoice.id };
}
