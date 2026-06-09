"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addSubscriberAction(formData: FormData): Promise<{ ok: true } | { error: string }> {
  await requireAuth();
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const name  = (formData.get("name")  as string)?.trim() || null;

  if (!email) return { error: "Email is required." };

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email, name, source: "manual", status: "active" },
    { onConflict: "email", ignoreDuplicates: false }
  );

  if (error) return { error: error.message };

  revalidatePath("/marketing/email");
  return { ok: true };
}

export async function unsubscribeAction(id: string): Promise<{ ok: true } | { error: string }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/marketing/email");
  return { ok: true };
}

export async function deleteSubscriberAction(id: string): Promise<{ ok: true } | { error: string }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/marketing/email");
  return { ok: true };
}
