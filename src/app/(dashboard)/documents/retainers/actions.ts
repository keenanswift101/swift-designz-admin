"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { RetainerContent } from "@/types/estore-retainer";

async function requireAdmin() {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return { user, supabase };
}

export async function createRetainerAction(name: string, content: RetainerContent): Promise<{ error: string } | void> {
  const { user, supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("retainers")
    .insert({ name, content, created_by: user.id, updated_by: user.id })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed to create retainer" };

  revalidatePath("/documents/retainers");
  redirect(`/documents/retainers/${data.id}/edit`);
}

export async function updateRetainerAction(id: string, name: string, content: RetainerContent): Promise<{ error: string } | void> {
  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("retainers")
    .update({ name, content, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/documents/retainers");
  revalidatePath(`/documents/retainers/${id}`);
  revalidatePath(`/documents/retainers/${id}/edit`);
}

export async function deleteRetainerAction(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("retainers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/documents/retainers");
  redirect("/documents/retainers");
}
