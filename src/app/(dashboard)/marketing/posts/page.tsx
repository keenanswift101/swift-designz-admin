import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";
import PublishedPostsList from "@/components/marketing/PublishedPostsList";
import type { ContentPost, MarketingCampaign } from "@/types/marketing";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

export default async function PublishedPostsPage() {
  await requireAuth();
  const supabase = await createClient();

  const [{ data: publishedData }, { data: draftsData }, { data: campaignsData }] = await Promise.all([
    supabase
      .from("content_posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase
      .from("content_posts")
      .select("*")
      .eq("status", "draft")
      .order("created_at", { ascending: false }),
    supabase.from("marketing_campaigns").select("id, name").order("name"),
  ]);

  const posts     = (publishedData ?? []) as unknown as ContentPost[];
  const drafts    = (draftsData    ?? []) as unknown as ContentPost[];
  const campaigns = (campaignsData ?? []) as unknown as Pick<MarketingCampaign, "id" | "name">[];

  const platforms = [...new Set(posts.map((p) => p.platform))];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const last30 = posts.filter((p) => {
    const d = p.scheduled_at ?? p.created_at;
    return d && new Date(d) >= cutoff;
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Posts"
        description="Published assets and AI-generated drafts"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Published" value={String(posts.length)}    />
        <Stat label="Last 30 Days"    value={String(last30)}          />
        <Stat label="Platforms"       value={String(platforms.length)}/>
        <Stat label="Drafts"          value={String(drafts.length)}   />
      </div>

      <PublishedPostsList posts={posts} drafts={drafts} campaigns={campaigns} />
    </div>
  );
}
