"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import type { EmailRecipientType } from "@/types/marketing";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createEmailCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("email_campaigns").insert({
    name:             (formData.get("name") as string).trim(),
    subject:          (formData.get("subject") as string).trim(),
    body_html:        (formData.get("body_html") as string) || "",
    body_text:        (formData.get("body_text") as string) || "",
    status:           "draft",
    recipient_type:   (formData.get("recipient_type") as EmailRecipientType) || "all_clients",
    custom_recipients: ((formData.get("custom_recipients") as string) || "")
      .split(/[\n,]+/).map((e) => e.trim()).filter(Boolean),
    campaign_id:      (formData.get("campaign_id") as string) || null,
    created_by:       user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/marketing/email");
  return { ok: true };
}

export async function updateEmailCampaignAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("email_campaigns").update({
    name:             (formData.get("name") as string).trim(),
    subject:          (formData.get("subject") as string).trim(),
    body_html:        (formData.get("body_html") as string) || "",
    body_text:        (formData.get("body_text") as string) || "",
    recipient_type:   formData.get("recipient_type") as EmailRecipientType,
    custom_recipients: ((formData.get("custom_recipients") as string) || "")
      .split(/[\n,]+/).map((e) => e.trim()).filter(Boolean),
    campaign_id:      (formData.get("campaign_id") as string) || null,
    updated_at:       new Date().toISOString(),
  }).eq("id", id).eq("status", "draft");

  if (error) return { error: error.message };
  revalidatePath("/marketing/email");
  return { ok: true };
}

export async function deleteEmailCampaignAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("email_campaigns").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/marketing/email");
  return { ok: true };
}

export async function sendEmailCampaignAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can send email campaigns." };

  const { data: campaign } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (!campaign) return { error: "Campaign not found" };
  if (campaign.status === "sent") return { error: "This campaign has already been sent." };

  const admin = createAdminClient();

  let recipientEmails: string[] = [];

  if (campaign.recipient_type === "all_clients") {
    const { data: clients } = await admin
      .from("clients")
      .select("email")
      .not("email", "is", null);
    recipientEmails = (clients ?? []).map((c: { email: string }) => c.email).filter(Boolean);
  } else if (campaign.recipient_type === "all_leads") {
    const { data: leads } = await admin
      .from("leads")
      .select("email")
      .not("email", "is", null);
    recipientEmails = (leads ?? []).map((l: { email: string }) => l.email).filter(Boolean);
  } else {
    recipientEmails = (campaign.custom_recipients as string[]) ?? [];
  }

  if (recipientEmails.length === 0) return { error: "No recipients found." };

  // Send in batches of 50
  const BATCH = 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipientEmails.length; i += BATCH) {
    const batch = recipientEmails.slice(i, i + BATCH);
    const emails = batch.map((to) => ({
      from: "Swift Designz <info@swiftdesignz.co.za>",
      to: [to],
      subject: campaign.subject as string,
      html: campaign.body_html as string,
      text: (campaign.body_text as string) || undefined,
    }));

    try {
      await resend.batch.send(emails);
      sent += batch.length;
    } catch {
      failed += batch.length;
    }
  }

  if (sent === 0) return { error: "All sends failed." };

  await admin.from("email_campaigns").update({
    status: "sent",
    recipient_count: sent,
    sent_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath("/marketing/email");
  return { ok: true, sent, failed };
}
