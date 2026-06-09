"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CampaignChannel, CampaignStatus, CampaignGoal } from "@/types/marketing";

export async function createCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const budgetRaw = parseFloat((formData.get("budget") as string) || "0");
  const spentRaw  = parseFloat((formData.get("spent")  as string) || "0");

  const { error } = await supabase.from("marketing_campaigns").insert({
    name:            (formData.get("name") as string).trim(),
    description:     (formData.get("description") as string)?.trim() || null,
    channel:         (formData.get("channel") as CampaignChannel) || "social_media",
    status:          (formData.get("status")  as CampaignStatus)  || "draft",
    goal:            (formData.get("goal")    as CampaignGoal)    || null,
    budget_cents:    Math.round(budgetRaw * 100),
    spent_cents:     Math.round(spentRaw  * 100),
    start_date:      (formData.get("start_date") as string) || null,
    end_date:        (formData.get("end_date")   as string) || null,
    target_audience: (formData.get("target_audience") as string)?.trim() || null,
    notes:           (formData.get("notes") as string)?.trim() || null,
    created_by:      user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/marketing/campaigns");
  return { ok: true };
}

export async function updateCampaignAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const budgetRaw = parseFloat((formData.get("budget") as string) || "0");
  const spentRaw  = parseFloat((formData.get("spent")  as string) || "0");

  const { error } = await supabase.from("marketing_campaigns").update({
    name:            (formData.get("name") as string).trim(),
    description:     (formData.get("description") as string)?.trim() || null,
    channel:         formData.get("channel") as CampaignChannel,
    status:          formData.get("status")  as CampaignStatus,
    goal:            (formData.get("goal") as CampaignGoal) || null,
    budget_cents:    Math.round(budgetRaw * 100),
    spent_cents:     Math.round(spentRaw  * 100),
    start_date:      (formData.get("start_date") as string) || null,
    end_date:        (formData.get("end_date")   as string) || null,
    target_audience: (formData.get("target_audience") as string)?.trim() || null,
    notes:           (formData.get("notes") as string)?.trim() || null,
    updated_at:      new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/marketing/campaigns");
  return { ok: true };
}

export async function deleteCampaignAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("marketing_campaigns").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/marketing/campaigns");
  return { ok: true };
}

export async function createContentPostAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const scheduledAt = formData.get("scheduled_at") as string;

  const { error } = await supabase.from("content_posts").insert({
    title:        (formData.get("title") as string).trim(),
    content:      (formData.get("content") as string)?.trim() || null,
    platform:     formData.get("platform") as string,
    status:       scheduledAt ? "scheduled" : "draft",
    campaign_id:  (formData.get("campaign_id") as string) || null,
    scheduled_at: scheduledAt || null,
    notes:        (formData.get("notes") as string)?.trim() || null,
    created_by:   user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/marketing/calendar");
  return { ok: true };
}

export async function updateContentPostAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const scheduledAt = formData.get("scheduled_at") as string;

  const { error } = await supabase.from("content_posts").update({
    title:        (formData.get("title") as string).trim(),
    content:      (formData.get("content") as string)?.trim() || null,
    platform:     formData.get("platform") as string,
    status:       formData.get("status") as string,
    campaign_id:  (formData.get("campaign_id") as string) || null,
    scheduled_at: scheduledAt || null,
    notes:        (formData.get("notes") as string)?.trim() || null,
    updated_at:   new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/marketing/calendar");
  return { ok: true };
}

export async function deleteContentPostAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("content_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/marketing/calendar");
  return { ok: true };
}
