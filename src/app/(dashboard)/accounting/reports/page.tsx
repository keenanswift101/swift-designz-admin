import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import ExportExcel from "@/components/accounting/ExportExcel";
import RevenueChart, { type RevenueDataPoint } from "@/components/dashboard/RevenueChart";
import IncomeCategoryChart, { type CategoryDataPoint as IncomeCatPoint } from "@/components/accounting/IncomeCategoryChart";
import ExpenseCategoryChart, { type CategoryDataPoint as ExpenseCatPoint } from "@/components/accounting/ExpenseCategoryChart";
import ProfitMarginChart, { type MarginDataPoint } from "@/components/accounting/ProfitMarginChart";
import type { IncomeEntry, Expense } from "@/types/database";

const incomeCategoryLabels: Record<string, string> = {
  web_dev: "Web Development",
  ecommerce: "E-Commerce",
  apps: "Apps",
  training: "Training",
  consulting: "Consulting",
  investment: "Investment",
  other: "Other",
};

const expenseCategoryLabels: Record<string, string> = {
  hosting: "Hosting",
  software: "Software",
  subscriptions: "Subscriptions",
  hardware: "Hardware",
  marketing: "Marketing",
  transport: "Transport",
  office: "Office",
  professional_services: "Professional Services",
  other: "Other",
};

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string) {
  const [y, m] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString("en-ZA", { month: "short", year: "numeric" });
}

function momPct(current: number, previous: number): string {
  if (previous === 0 && current === 0) return "—";
  if (previous === 0) return "new";
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

function momColor(current: number, previous: number, inverse = false): string {
  if (previous === 0 && current === 0) return "text-gray-600";
  if (previous === 0) return "text-teal";
  const up = current >= previous;
  const positive = inverse ? !up : up;
  return positive ? "text-green-400" : "text-red-400";
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;

  const [{ data: incomeData }, { data: expenseData }] = await Promise.all([
    supabase.from("income_entries").select("*").gte("date", yearStart).order("date"),
    supabase.from("expenses").select("*").gte("date", yearStart).order("date"),
  ]);

  const income = (incomeData ?? []) as IncomeEntry[];
  const expenses = (expenseData ?? []) as Expense[];

  // ── Month aggregation ──
  const months = new Set<string>();
  income.forEach((i) => months.add(getMonthKey(i.date)));
  expenses.forEach((e) => months.add(getMonthKey(e.date)));
  const sortedMonths = [...months].sort();

  const incomeByCategory: Record<string, Record<string, number>> = {};
  income.forEach((i) => {
    const mk = getMonthKey(i.date);
    if (!incomeByCategory[i.category]) incomeByCategory[i.category] = {};
    incomeByCategory[i.category][mk] = (incomeByCategory[i.category][mk] ?? 0) + i.amount;
  });

  const expenseByCategory: Record<string, Record<string, number>> = {};
  expenses.forEach((e) => {
    const mk = getMonthKey(e.date);
    if (!expenseByCategory[e.category]) expenseByCategory[e.category] = {};
    expenseByCategory[e.category][mk] = (expenseByCategory[e.category][mk] ?? 0) + e.amount;
  });

  const monthlyIncome: Record<string, number> = {};
  const monthlyExpenses: Record<string, number> = {};
  sortedMonths.forEach((m) => {
    monthlyIncome[m] = Object.values(incomeByCategory).reduce((s, c) => s + (c[m] ?? 0), 0);
    monthlyExpenses[m] = Object.values(expenseByCategory).reduce((s, c) => s + (c[m] ?? 0), 0);
  });

  const ytdIncome = income.reduce((s, i) => s + i.amount, 0);
  const ytdExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const ytdNet = ytdIncome - ytdExpenses;
  const ytdMargin = ytdIncome > 0 ? Math.round((ytdNet / ytdIncome) * 100) : 0;

  // ── 12-month chart data ──
  const chartMonths: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
    chartMonths.push({ key, label });
  }
  const chartMap = new Map<string, { income: number; expenses: number }>(
    chartMonths.map(({ key }) => [key, { income: 0, expenses: 0 }])
  );
  income.forEach((i) => {
    const entry = chartMap.get(i.date.slice(0, 7));
    if (entry) entry.income += i.amount;
  });
  expenses.forEach((e) => {
    const entry = chartMap.get(e.date.slice(0, 7));
    if (entry) entry.expenses += e.amount;
  });
  const revenueData: RevenueDataPoint[] = chartMonths.map(({ key, label }) => ({
    month: label,
    income: chartMap.get(key)?.income ?? 0,
    expenses: chartMap.get(key)?.expenses ?? 0,
  }));

  // ── Income by category (for chart) ──
  const incomeCatData: IncomeCatPoint[] = Object.entries(incomeByCategory).map(([cat, vals]) => {
    const total = Object.values(vals).reduce((s, v) => s + v, 0);
    return { category: incomeCategoryLabels[cat] ?? cat, amount: total, pct: ytdIncome > 0 ? (total / ytdIncome) * 100 : 0 };
  });

  // ── Expense by category (for chart) ──
  const expenseCatData: ExpenseCatPoint[] = Object.entries(expenseByCategory).map(([cat, vals]) => {
    const total = Object.values(vals).reduce((s, v) => s + v, 0);
    return { category: expenseCategoryLabels[cat] ?? cat, amount: total, pct: ytdExpenses > 0 ? (total / ytdExpenses) * 100 : 0 };
  });

  // ── Profit margin trend ──
  const marginData: MarginDataPoint[] = chartMonths.map(({ key, label }) => {
    const inc = chartMap.get(key)?.income ?? 0;
    const exp = chartMap.get(key)?.expenses ?? 0;
    const net = inc - exp;
    return { month: label, margin: inc > 0 ? (net / inc) * 100 : 0, income: inc, net };
  });

  return (
    <>
      <PageHeader
        title="Financial Reports"
        description={`Profit & Loss — ${now.getFullYear()}`}
        backHref="/accounting"
        actions={<ExportExcel />}
      />

      {/* YTD Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">YTD Income</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(ytdIncome)}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">YTD Expenses</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(ytdExpenses)}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Profit</p>
          <p className={`text-xl font-bold ${ytdNet >= 0 ? "text-teal" : "text-red-400"}`}>
            {ytdNet < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdNet))}
          </p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Margin</p>
          <p className={`text-xl font-bold ${ytdMargin >= 0 ? "text-teal" : "text-red-400"}`}>
            {ytdMargin}%
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <RevenueChart data={revenueData} />
      </div>

      {/* Category charts + margin trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <IncomeCategoryChart data={incomeCatData} />
        <ExpenseCategoryChart data={expenseCatData} />
      </div>
      <div className="mb-6">
        <ProfitMarginChart data={marginData} />
      </div>

      {/* Monthly P&L Table */}
      <div className="glass-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-background">Category</th>
                {sortedMonths.map((m) => (
                  <th key={m} className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {getMonthLabel(m)}
                  </th>
                ))}
                <th className="text-right px-5 py-3 text-xs font-medium text-teal uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Revenue */}
              <tr className="border-b border-border bg-teal-subtle/30">
                <td colSpan={sortedMonths.length + 2} className="px-5 py-2 text-xs font-bold text-green-400 uppercase tracking-widest">Revenue</td>
              </tr>
              {Object.entries(incomeByCategory).map(([cat, vals]) => {
                const total = Object.values(vals).reduce((s, v) => s + v, 0);
                return (
                  <tr key={`inc-${cat}`} className="border-b border-border/50 hover:bg-card">
                    <td className="px-5 py-2.5 text-sm text-foreground/60 sticky left-0 bg-background">{incomeCategoryLabels[cat] ?? cat}</td>
                    {sortedMonths.map((m) => (
                      <td key={m} className="px-4 py-2.5 text-sm text-gray-400 text-right font-mono">{vals[m] ? formatCurrency(vals[m]) : "—"}</td>
                    ))}
                    <td className="px-5 py-2.5 text-sm text-foreground text-right font-mono font-medium">{formatCurrency(total)}</td>
                  </tr>
                );
              })}
              <tr className="border-b border-border">
                <td className="px-5 py-2.5 text-sm font-semibold text-green-400 sticky left-0 bg-background">Total Income</td>
                {sortedMonths.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-sm text-green-400 text-right font-mono font-semibold">{formatCurrency(monthlyIncome[m] ?? 0)}</td>
                ))}
                <td className="px-5 py-2.5 text-sm text-green-400 text-right font-mono font-bold">{formatCurrency(ytdIncome)}</td>
              </tr>
              {/* MoM income change */}
              <tr className="border-b border-border/30 bg-card/40">
                <td className="px-5 py-1.5 text-xs text-gray-600 sticky left-0 bg-card/40 italic">vs prev month</td>
                {sortedMonths.map((m, i) => {
                  const prev = i > 0 ? (monthlyIncome[sortedMonths[i - 1]] ?? 0) : 0;
                  const curr = monthlyIncome[m] ?? 0;
                  return (
                    <td key={m} className={`px-4 py-1.5 text-xs text-right font-mono ${i === 0 ? "text-gray-600" : momColor(curr, prev)}`}>
                      {i === 0 ? "—" : momPct(curr, prev)}
                    </td>
                  );
                })}
                <td className="px-5 py-1.5" />
              </tr>

              {/* Expenses */}
              <tr className="border-b border-border bg-danger-subtle/30">
                <td colSpan={sortedMonths.length + 2} className="px-5 py-2 text-xs font-bold text-red-400 uppercase tracking-widest">Expenses</td>
              </tr>
              {Object.entries(expenseByCategory).map(([cat, vals]) => {
                const total = Object.values(vals).reduce((s, v) => s + v, 0);
                return (
                  <tr key={`exp-${cat}`} className="border-b border-border/50 hover:bg-card">
                    <td className="px-5 py-2.5 text-sm text-foreground/60 sticky left-0 bg-background">{expenseCategoryLabels[cat] ?? cat}</td>
                    {sortedMonths.map((m) => (
                      <td key={m} className="px-4 py-2.5 text-sm text-gray-400 text-right font-mono">{vals[m] ? formatCurrency(vals[m]) : "—"}</td>
                    ))}
                    <td className="px-5 py-2.5 text-sm text-foreground text-right font-mono font-medium">{formatCurrency(total)}</td>
                  </tr>
                );
              })}
              <tr className="border-b border-border">
                <td className="px-5 py-2.5 text-sm font-semibold text-red-400 sticky left-0 bg-background">Total Expenses</td>
                {sortedMonths.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-sm text-red-400 text-right font-mono font-semibold">{formatCurrency(monthlyExpenses[m] ?? 0)}</td>
                ))}
                <td className="px-5 py-2.5 text-sm text-red-400 text-right font-mono font-bold">{formatCurrency(ytdExpenses)}</td>
              </tr>
              {/* MoM expense change */}
              <tr className="border-b border-border/30 bg-card/40">
                <td className="px-5 py-1.5 text-xs text-gray-600 sticky left-0 bg-card/40 italic">vs prev month</td>
                {sortedMonths.map((m, i) => {
                  const prev = i > 0 ? (monthlyExpenses[sortedMonths[i - 1]] ?? 0) : 0;
                  const curr = monthlyExpenses[m] ?? 0;
                  return (
                    <td key={m} className={`px-4 py-1.5 text-xs text-right font-mono ${i === 0 ? "text-gray-600" : momColor(curr, prev, true)}`}>
                      {i === 0 ? "—" : momPct(curr, prev)}
                    </td>
                  );
                })}
                <td className="px-5 py-1.5" />
              </tr>

              {/* Net */}
              <tr className="border-t-2 border-teal/30">
                <td className="px-5 py-3 text-sm font-bold text-foreground sticky left-0 bg-background">Net Profit / Loss</td>
                {sortedMonths.map((m) => {
                  const net = (monthlyIncome[m] ?? 0) - (monthlyExpenses[m] ?? 0);
                  return (
                    <td key={m} className={`px-4 py-3 text-sm text-right font-mono font-bold ${net >= 0 ? "text-teal" : "text-red-400"}`}>
                      {net < 0 ? "-" : ""}{formatCurrency(Math.abs(net))}
                    </td>
                  );
                })}
                <td className={`px-5 py-3 text-sm text-right font-mono font-bold ${ytdNet >= 0 ? "text-teal" : "text-red-400"}`}>
                  {ytdNet < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdNet))}
                </td>
              </tr>

              {/* Net Margin % */}
              <tr className="border-t border-border/30 bg-card/40">
                <td className="px-5 py-2 text-xs font-medium text-gray-500 sticky left-0 bg-card/40">Net Margin %</td>
                {sortedMonths.map((m) => {
                  const inc = monthlyIncome[m] ?? 0;
                  const net = inc - (monthlyExpenses[m] ?? 0);
                  const pct = inc > 0 ? Math.round((net / inc) * 100) : 0;
                  return (
                    <td key={m} className={`px-4 py-2 text-xs text-right font-mono font-medium ${pct >= 0 ? "text-teal" : "text-red-400"}`}>
                      {inc > 0 ? `${pct}%` : "—"}
                    </td>
                  );
                })}
                <td className={`px-5 py-2 text-xs text-right font-mono font-medium ${ytdMargin >= 0 ? "text-teal" : "text-red-400"}`}>
                  {ytdIncome > 0 ? `${ytdMargin}%` : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
