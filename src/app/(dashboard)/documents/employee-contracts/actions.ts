"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TempContractContent, ContractType } from "@/types/employee-contract";

async function requireAdmin() {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return { user, supabase };
}

export async function createEmployeeContractAction(
  name: string,
  contractType: ContractType,
  content: TempContractContent,
): Promise<{ error: string } | void> {
  const { user, supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("employee_contracts")
    .insert({ name, contract_type: contractType, content, created_by: user.id, updated_by: user.id })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed to create contract" };

  revalidatePath("/documents/employee-contracts");
  redirect(`/documents/employee-contracts/${data.id}/edit`);
}

export async function updateEmployeeContractAction(
  id: string,
  name: string,
  content: TempContractContent,
): Promise<{ error: string } | void> {
  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("employee_contracts")
    .update({ name, content, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/documents/employee-contracts");
  revalidatePath(`/documents/employee-contracts/${id}`);
  revalidatePath(`/documents/employee-contracts/${id}/edit`);
}

export async function deleteEmployeeContractAction(id: string): Promise<{ error: string } | void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("employee_contracts").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/documents/employee-contracts");
  redirect("/documents/employee-contracts");
}
