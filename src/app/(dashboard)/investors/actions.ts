"use server";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { InvestorStatus } from "@/types/database";
import { sendReceiptEmail } from "@/lib/email";

export async function createInvestorAction(formData: FormData) {
  await requireAuth();
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const company = (formData.get("company") as string)?.trim() || null;

  const amountRaw = (formData.get("investment_amount") as string)?.trim();
  if (!amountRaw) return { error: "Investment amount is required." };
  const parsed = parseFloat(amountRaw);
  if (isNaN(parsed) || parsed < 0) return { error: "Investment amount must be a valid number." };
  const investment_amount = Math.round(parsed * 100);

  const equityRaw = (formData.get("equity_percentage") as string)?.trim();
  const equity_percentage = equityRaw ? parseFloat(equityRaw) : null;
  if (equity_percentage !== null && (isNaN(equity_percentage) || equity_percentage < 0 || equity_percentage > 100)) {
    return { error: "Equity must be between 0 and 100." };
  }

  const agreement_date = (formData.get("agreement_date") as string) || null;
  const status = (formData.get("status") as InvestorStatus) || "prospective";
  const notes = (formData.get("notes") as string)?.trim() || null;

  const { error } = await supabase.from("investors").insert({
    name,
    email,
    phone,
    company,
    investment_amount,
    equity_percentage,
    agreement_date,
    status,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath("/investors");
  redirect("/investors");
}

export async function updateInvestorAction(id: string, formData: FormData) {
  await requireAuth();
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const company = (formData.get("company") as string)?.trim() || null;

  const amountRaw = (formData.get("investment_amount") as string)?.trim();
  if (!amountRaw) return { error: "Investment amount is required." };
  const parsed = parseFloat(amountRaw);
  if (isNaN(parsed) || parsed < 0) return { error: "Investment amount must be a valid number." };
  const investment_amount = Math.round(parsed * 100);

  const equityRaw = (formData.get("equity_percentage") as string)?.trim();
  const equity_percentage = equityRaw ? parseFloat(equityRaw) : null;
  if (equity_percentage !== null && (isNaN(equity_percentage) || equity_percentage < 0 || equity_percentage > 100)) {
    return { error: "Equity must be between 0 and 100." };
  }

  const agreement_date = (formData.get("agreement_date") as string) || null;
  const status = (formData.get("status") as InvestorStatus) || "prospective";
  const notes = (formData.get("notes") as string)?.trim() || null;

  const { error } = await supabase
    .from("investors")
    .update({ name, email, phone, company, investment_amount, equity_percentage, agreement_date, status, notes })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/investors");
  revalidatePath(`/investors/${id}`);
  redirect(`/investors/${id}`);
}

export async function deleteInvestorAction(id: string) {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("investors").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/investors");
  redirect("/investors");
}

export async function addContributionAction(investorId: string, formData: FormData) {
  await requireAuth();
  const supabase = await createClient();

  const description = (formData.get("description") as string)?.trim();
  if (!description) return { error: "Description is required." };

  const amountRaw = (formData.get("amount") as string)?.trim();
  if (!amountRaw) return { error: "Amount is required." };
  const parsed = parseFloat(amountRaw);
  if (isNaN(parsed) || parsed <= 0) return { error: "Amount must be a positive number." };
  const amount = Math.round(parsed * 100);

  const date = formData.get("date") as string;
  if (!date) return { error: "Date is required." };

  const notes = (formData.get("notes") as string)?.trim() || null;

  const { error } = await supabase.from("income_entries").insert({
    source: "investor",
    investor_id: investorId,
    description,
    amount,
    date,
    category: "investment",
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath(`/investors/${investorId}`);
  revalidatePath("/accounting/income");
  revalidatePath("/accounting");
  redirect(`/investors/${investorId}`);
}

export async function sendInvestorReceiptAction(
  entryId: string
): Promise<{ error: string } | { ok: true }> {
  await requireAuth();
  const supabase = createAdminClient();

  // Fetch the contribution entry joined with investor details
  const { data: entry } = await supabase
    .from("income_entries")
    .select(`
      id, amount, description, date, receipt_number, sent_at,
      investors(id, name, email, investment_amount)
    `)
    .eq("id", entryId)
    .eq("source", "investor")
    .single();

  if (!entry) return { error: "Contribution not found." };

  type Inv = { id: string; name: string; email: string | null; investment_amount: number };
  const investor = entry.investors as unknown as Inv | null;
  if (!investor?.email) return { error: "Investor has no email address." };

  // Generate receipt number if not yet assigned
  let receiptNumber = entry.receipt_number as string | null;
  if (!receiptNumber) {
    const { data: num } = await supabase.rpc("generate_ar_number", { p_type: "receipt" });
    receiptNumber = num as string;
    await supabase
      .from("income_entries")
      .update({ receipt_number: receiptNumber })
      .eq("id", entryId);
  }

  // Compute total contributed (all entries for this investor) to derive remaining balance
  const { data: allEntries } = await supabase
    .from("income_entries")
    .select("amount")
    .eq("investor_id", investor.id)
    .eq("source", "investor");
  const totalContributed = (allEntries ?? []).reduce((s: number, e: { amount: number }) => s + e.amount, 0);
  const remaining = Math.max(0, investor.investment_amount - totalContributed);

  try {
    await sendReceiptEmail({
      to: investor.email,
      clientName: investor.name,
      receiptNumber: receiptNumber!,
      invoiceNumber: (entry.description as string) || "Capital Contribution",
      paymentAmount: entry.amount as number,
      paymentMethod: "eft",
      paymentDate: entry.date as string,
      invoiceTotal: investor.investment_amount,
      balance: remaining,
    });
  } catch (err) {
    return { error: `Email failed: ${String(err)}` };
  }

  await supabase
    .from("income_entries")
    .update({ sent_at: new Date().toISOString(), sent_to: investor.email })
    .eq("id", entryId);

  revalidatePath("/accounts-receivable/payments");
  revalidatePath(`/investors/${investor.id}`);
  return { ok: true };
}
