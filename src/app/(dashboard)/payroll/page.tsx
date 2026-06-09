import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";
import PayrollClient, { type Run } from "./PayrollClient";

export default async function PayrollPage() {
  await requireAuth();
  const supabase = await createClient();

  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;

  const [{ data: runs }, { data: employees }] = await Promise.all([
    supabase
      .from("payroll_runs")
      .select("*, payroll_entries(*)")
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false }),
    supabase
      .from("employees")
      .select("id, name, role, salary")
      .eq("status", "active")
      .order("name"),
  ]);

  const safeRuns = runs ?? [];
  const safeEmployees = employees ?? [];

  const activeCount = safeEmployees.length;
  const monthlyGross = safeEmployees.reduce((s, e) => s + (e.salary ?? 0), 0);
  const ytdFunded = safeRuns
    .filter((r) => r.status !== "draft" && r.funded_at && r.funded_at >= yearStart)
    .reduce((s, r) => s + (r.funded_amount_cents ?? r.total_to_fund_cents ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Monthly payroll runs — fund your payroll company account and track disbursements"
      />
      <PayrollClient
        runs={safeRuns as unknown as Run[]}
        employees={safeEmployees}
        activeCount={activeCount}
        monthlyGross={monthlyGross}
        ytdFunded={ytdFunded}
      />
    </div>
  );
}
