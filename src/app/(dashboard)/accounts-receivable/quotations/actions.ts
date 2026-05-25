"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { QuotationLineItem, DiscountType } from "@/types/accounts-receivable";

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
