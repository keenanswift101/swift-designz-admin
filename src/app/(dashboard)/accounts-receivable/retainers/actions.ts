"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

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
