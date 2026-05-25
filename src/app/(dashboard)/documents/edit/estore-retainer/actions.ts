"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { EstoreRetainerContent } from "@/types/estore-retainer";

export async function saveEstoreRetainerOverride(content: EstoreRetainerContent) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const { error } = await supabase.from("document_overrides").upsert(
    { slug: "estore-retainer", content, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "slug" },
  );

  if (error) throw new Error(error.message);

  revalidatePath("/documents/view/estore-retainer");
  revalidatePath("/documents/edit/estore-retainer");
}
