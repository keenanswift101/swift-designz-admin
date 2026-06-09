import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import CampaignTable from "@/components/marketing/CampaignTable";
import type { MarketingCampaign } from "@/types/marketing";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

export default async function CampaignsPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (campaigns ?? []) as unknown as MarketingCampaign[];

  const active      = list.filter((c) => c.status === "active").length;
  const totalBudget = list.reduce((s, c) => s + c.budget_cents, 0);
  const totalSpent  = list.reduce((s, c) => s + c.spent_cents, 0);
  const completed   = list.filter((c) => c.status === "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Campaigns" description="Track marketing campaigns across all channels" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Active"    value={String(active)}              />
        <Stat label="Budget"    value={formatCurrency(totalBudget)} />
        <Stat label="Spent"     value={formatCurrency(totalSpent)}  />
        <Stat label="Completed" value={String(completed)}           />
      </div>

      <CampaignTable campaigns={list} />
    </div>
  );
}
