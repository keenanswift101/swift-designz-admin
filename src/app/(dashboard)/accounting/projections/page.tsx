import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import ProjectionsTable, { type MonthRow } from "@/components/accounting/ProjectionsTable";
import type { RevenueProjection } from "@/types/database";

export default async function ProjectionsPage() {
  const supabase = await createClient();

  // Generate current month + next 11 months (12 total)
  const now = new Date();
  const months: { month: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const label = d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
    months.push({ month, label });
  }

  const firstMonth = months[0].month;
  const lastMonth = months[11].month;

  const [projectionsResult, incomeResult, expensesResult] = await Promise.all([
    supabase
      .from("revenue_projections")
      .select("*")
      .gte("month", firstMonth)
      .lte("month", lastMonth),
    supabase
      .from("income_entries")
      .select("amount, date")
      .gte("date", firstMonth),
    supabase
      .from("expenses")
      .select("amount, date")
      .gte("date", firstMonth),
  ]);

  // Guard: table may not exist yet in the live DB
  const projections = (Array.isArray(projectionsResult.data) ? projectionsResult.data : []) as RevenueProjection[];
  const incomeEntries = (incomeResult.data ?? []) as { amount: number; date: string }[];
  const expenseEntries = (expensesResult.data ?? []) as { amount: number; date: string }[];

  // Map projections by month key YYYY-MM
  const projMap = new Map<string, RevenueProjection>();
  projections.forEach((p) => projMap.set(p.month.slice(0, 7), p));

  // Group actuals by month
  const actualIncomeMap = new Map<string, number>();
  const actualExpensesMap = new Map<string, number>();
  incomeEntries.forEach((e) => {
    const key = e.date.slice(0, 7);
    actualIncomeMap.set(key, (actualIncomeMap.get(key) ?? 0) + e.amount);
  });
  expenseEntries.forEach((e) => {
    const key = e.date.slice(0, 7);
    actualExpensesMap.set(key, (actualExpensesMap.get(key) ?? 0) + e.amount);
  });

  const rows: MonthRow[] = months.map(({ month, label }) => {
    const key = month.slice(0, 7);
    return {
      month,
      monthLabel: label,
      projection: projMap.get(key) ?? null,
      actualIncome: actualIncomeMap.get(key) ?? 0,
      actualExpenses: actualExpensesMap.get(key) ?? 0,
    };
  });

  const totalProjIncome = projections.reduce((s, p) => s + p.projected_income, 0);
  const totalProjExpenses = projections.reduce((s, p) => s + p.projected_expenses, 0);
  const totalProjNet = totalProjIncome - totalProjExpenses;
  const monthsSet = projections.length;

  return (
    <>
      <PageHeader
        title="Revenue Projections"
        description="12-month forward-looking income & expense forecasts"
        backHref="/accounting"
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Projected Net — Next 12 Months
            </p>
            {monthsSet > 0 ? (
              <>
                <p className={`text-5xl font-bold leading-none ${totalProjNet >= 0 ? "text-foreground" : "text-red-400"}`}>
                  {formatCurrency(Math.abs(totalProjNet))}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="text-teal font-medium">{formatCurrency(totalProjIncome)} projected income</span>
                  <span>&mdash;</span>
                  <span className="text-red-400/80 font-medium">{formatCurrency(totalProjExpenses)} projected expenses</span>
                </div>
              </>
            ) : (
              <p className="text-3xl font-semibold text-gray-600 leading-none">No projections set yet</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Months Configured</p>
            <p className="text-4xl font-bold text-teal">
              {monthsSet}
              <span className="text-gray-600 text-xl font-normal">/12</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-4">
          <TrendingUp className="h-5 w-5 text-teal mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalProjIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">Proj. Income (12mo)</p>
        </div>
        <div className="glass-card p-4">
          <TrendingDown className="h-5 w-5 text-red-400 mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalProjExpenses)}</p>
          <p className="text-xs text-gray-500 mt-1">Proj. Expenses (12mo)</p>
        </div>
        <div className="glass-card p-4">
          <DollarSign className={`h-5 w-5 mb-2 ${totalProjNet >= 0 ? "text-teal" : "text-red-400"}`} />
          <p className={`text-2xl font-bold ${totalProjNet >= 0 ? "text-teal" : "text-red-400"}`}>
            {formatCurrency(Math.abs(totalProjNet))}
          </p>
          <p className="text-xs text-gray-500 mt-1">Proj. Net (12mo)</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">12-Month Forecast vs. Actual</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Click the edit icon on any row to set or update projections for that month
          </p>
        </div>
        <ProjectionsTable rows={rows} />
      </div>
    </>
  );
}
