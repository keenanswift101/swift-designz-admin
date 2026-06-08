"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// SSC rates (Namibia Social Security Commission)
const SSC_EMPLOYEE_RATE = 0.009;  // 0.9%
const SSC_EMPLOYER_RATE = 0.018;  // 1.8%

function calcSSC(grossCents: number) {
  return {
    employee: Math.round(grossCents * SSC_EMPLOYEE_RATE),
    employer: Math.round(grossCents * SSC_EMPLOYER_RATE),
  };
}

export async function createPayrollRunAction(
  year: number,
  month: number,
  payrollCompany: string,
  notes: string,
) {
  const supabase = await createClient();

  // Fetch all active employees
  const { data: employees, error: empErr } = await supabase
    .from("employees")
    .select("id, name, role, salary")
    .eq("status", "active");

  if (empErr) return { error: empErr.message };
  if (!employees || employees.length === 0) return { error: "No active employees found." };

  // Build entries and totals
  let totalGross = 0;
  let totalSscEmployee = 0;
  let totalSscEmployer = 0;

  const entries = employees.map((emp) => {
    const gross = emp.salary ?? 0;
    const { employee: sscEmp, employer: sscEmr } = calcSSC(gross);
    totalGross += gross;
    totalSscEmployee += sscEmp;
    totalSscEmployer += sscEmr;
    return {
      employee_id: emp.id,
      employee_name: emp.name,
      role_snapshot: emp.role,
      gross_cents: gross,
      ssc_employee_cents: sscEmp,
      ssc_employer_cents: sscEmr,
      net_cents: gross - sscEmp,
    };
  });

  const totalNet = totalGross - totalSscEmployee;
  const totalToFund = totalGross + totalSscEmployer;

  // Insert run
  const { data: run, error: runErr } = await supabase
    .from("payroll_runs")
    .insert({
      period_year: year,
      period_month: month,
      payroll_company: payrollCompany || null,
      total_gross_cents: totalGross,
      total_ssc_employee_cents: totalSscEmployee,
      total_ssc_employer_cents: totalSscEmployer,
      total_net_cents: totalNet,
      total_to_fund_cents: totalToFund,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (runErr) return { error: runErr.message };

  // Insert entries
  const { error: entriesErr } = await supabase
    .from("payroll_entries")
    .insert(entries.map((e) => ({ ...e, payroll_run_id: run.id })));

  if (entriesErr) return { error: entriesErr.message };

  revalidatePath("/payroll");
  return { success: true, runId: run.id };
}

export async function approvePayrollRunAction(runId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payroll_runs")
    .update({ status: "approved" })
    .eq("id", runId)
    .eq("status", "draft");
  if (error) return { error: error.message };
  revalidatePath("/payroll");
  return { success: true };
}

export async function fundPayrollRunAction(
  runId: string,
  fundedAmountCents: number,
  fundedAt: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payroll_runs")
    .update({
      status: "funded",
      funded_amount_cents: fundedAmountCents,
      funded_at: fundedAt,
    })
    .eq("id", runId)
    .eq("status", "approved");
  if (error) return { error: error.message };
  revalidatePath("/payroll");
  return { success: true };
}

export async function markPayrollPaidAction(runId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payroll_runs")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", runId)
    .eq("status", "funded");
  if (error) return { error: error.message };
  revalidatePath("/payroll");
  return { success: true };
}

export async function deletePayrollRunAction(runId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payroll_runs")
    .delete()
    .eq("id", runId)
    .in("status", ["draft", "approved"]);
  if (error) return { error: error.message };
  revalidatePath("/payroll");
  return { success: true };
}
