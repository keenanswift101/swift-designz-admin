import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";
import EmailCampaignList from "@/components/marketing/EmailCampaignList";
import type { EmailCampaign, MarketingCampaign } from "@/types/marketing";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

export default async function EmailCampaignsPage() {
  await requireAuth();
  const supabase = await createClient();

  const [{ data: emails }, { data: campaigns }] = await Promise.all([
    supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("marketing_campaigns").select("id, name").order("name"),
  ]);

  const list = (emails ?? []) as unknown as EmailCampaign[];
  const sent  = list.filter((e) => e.status === "sent");
  const draft = list.filter((e) => e.status === "draft");
  const totalRecipients = sent.reduce((s, e) => s + (e.recipient_count ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Email Campaigns" description="Draft and send marketing emails to clients and leads" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="Sent"       value={String(sent.length)}       />
        <Stat label="Drafts"     value={String(draft.length)}      />
        <Stat label="Recipients" value={String(totalRecipients)}   />
      </div>

      <EmailCampaignList
        campaigns={list}
        marketingCampaigns={(campaigns ?? []) as unknown as Pick<MarketingCampaign, "id" | "name">[]}
      />
    </div>
  );
}
