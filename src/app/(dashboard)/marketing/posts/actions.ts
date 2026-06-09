"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { MARKETING_ASSETS, ASSET_BASE_URL } from "@/lib/marketing-context";

export async function importMarketingAssetsAction(): Promise<{ imported: number; skipped: number; error?: string }> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "viewer") {
    return { imported: 0, skipped: 0, error: "Unauthorized" };
  }

  // Get existing post titles to avoid duplicates
  const { data: existing } = await supabase
    .from("content_posts")
    .select("notes")
    .like("notes", "%swiftdesignz.co.za/marketing/%");

  const existingUrls = new Set((existing ?? []).map((r: { notes: string | null }) => r.notes ?? ""));

  const toInsert = MARKETING_ASSETS
    .map((asset) => ({
      title:        asset.title,
      platform:     asset.platform,
      status:       "published" as const,
      content:      null,
      notes:        `${ASSET_BASE_URL}/${asset.filename}`,
      scheduled_at: null,
      campaign_id:  null,
    }))
    .filter((row) => !existingUrls.has(row.notes));

  if (toInsert.length === 0) {
    return { imported: 0, skipped: MARKETING_ASSETS.length };
  }

  const { error } = await supabase.from("content_posts").insert(toInsert);

  if (error) {
    return { imported: 0, skipped: 0, error: error.message };
  }

  revalidatePath("/marketing/posts");
  return { imported: toInsert.length, skipped: MARKETING_ASSETS.length - toInsert.length };
}
