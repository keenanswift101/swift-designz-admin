"use server";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertProjectionAction(formData: FormData) {
  await requireAuth();
  const supabase = await createClient();

  const month = (formData.get("month") as string)?.trim();
  if (!month) return { error: "Month is required." };

  const incomeRaw = parseFloat((formData.get("projected_income") as string) || "0");
  const expensesRaw = parseFloat((formData.get("projected_expenses") as string) || "0");
  if (isNaN(incomeRaw) || incomeRaw < 0) return { error: "Projected income must be 0 or more." };
  if (isNaN(expensesRaw) || expensesRaw < 0) return { error: "Projected expenses must be 0 or more." };

  const { error } = await supabase.from("revenue_projections").upsert(
    {
      month,
      projected_income: Math.round(incomeRaw * 100),
      projected_expenses: Math.round(expensesRaw * 100),
      notes: (formData.get("notes") as string)?.trim() || null,
    },
    { onConflict: "month" },
  );

  if (error) {
    if (error.code === "42P01") return { error: "Run supabase/missing_tables.sql in the Supabase SQL editor first." };
    return { error: error.message };
  }

  revalidatePath("/accounting/projections");
  revalidatePath("/accounting");
}

export async function deleteProjectionAction(id: string) {
  await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase.from("revenue_projections").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/accounting/projections");
  revalidatePath("/accounting");
}
