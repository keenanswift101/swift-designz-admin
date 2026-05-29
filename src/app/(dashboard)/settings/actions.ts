"use server";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  await requireAuth();
  const fullName = formData.get("full_name") as string;
  if (!fullName?.trim()) return { error: "Full name is required." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
}

export async function changePasswordAction(formData: FormData) {
  await requireAuth();
  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!currentPassword) {
    return { error: "Current password is required." };
  }
  if (!newPassword || newPassword.length < 10) {
    return { error: "Password must be at least 10 characters." };
  }
  if (!/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return { error: "Password must contain at least one uppercase letter and one number." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated." };

  // Verify current password before allowing change
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "Incorrect current password." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: "Failed to update password. Please try again." };
  revalidatePath("/settings");
  return { success: "Password updated successfully." };
}

export async function updateBusinessSettingsAction(formData: FormData) {
  await requireAuth();
  const supabase = await createClient();

  // Get the singleton row
  const { data: existing } = await supabase
    .from("business_settings")
    .select("id")
    .limit(1)
    .single();

  if (!existing) return { error: "Business settings not found." };

  const updates = {
    company_name: (formData.get("company_name") as string)?.trim() || "Swift Designz Investments CC",
    tagline: (formData.get("tagline") as string)?.trim() || null,
    email: (formData.get("email") as string)?.trim() || null,
    phone: (formData.get("phone") as string)?.trim() || null,
    address: (formData.get("address") as string)?.trim() || null,
    city: (formData.get("city") as string)?.trim() || null,
    country: (formData.get("country") as string)?.trim() || null,
    website: (formData.get("website") as string)?.trim() || null,
    vat_number: (formData.get("vat_number") as string)?.trim() || null,
    registration_number: (formData.get("registration_number") as string)?.trim() || null,
    registration_date: (formData.get("registration_date") as string)?.trim() || null,
    directors: (formData.get("directors") as string)?.trim() || null,
    bank_name: (formData.get("bank_name") as string)?.trim() || null,
    bank_account_number: (formData.get("bank_account_number") as string)?.trim() || null,
    bank_branch_code: (formData.get("bank_branch_code") as string)?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("business_settings")
    .update(updates)
    .eq("id", existing.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
}
