import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import ContentCalendar from "@/components/marketing/ContentCalendar";
import type { ContentPost, MarketingCampaign } from "@/types/marketing";

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  await requireAuth();
  const supabase = await createClient();
  const params = await searchParams;

  const now = new Date();
  const year  = parseInt(params.year  ?? String(now.getFullYear()));
  const month = parseInt(params.month ?? String(now.getMonth() + 1));

  // Fetch posts for ±1 month window so prev/next navigation feels instant
  const from = new Date(year, month - 2, 1).toISOString();
  const to   = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const [{ data: posts }, { data: campaigns }] = await Promise.all([
    supabase
      .from("content_posts")
      .select("*")
      .gte("scheduled_at", from)
      .lte("scheduled_at", to)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("marketing_campaigns")
      .select("id, name")
      .order("name"),
  ]);

  return (
    <ContentCalendar
      posts={(posts ?? []) as unknown as ContentPost[]}
      campaigns={(campaigns ?? []) as unknown as Pick<MarketingCampaign, "id" | "name">[]}
      year={year}
      month={month}
    />
  );
}
