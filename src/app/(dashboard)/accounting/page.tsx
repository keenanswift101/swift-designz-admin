import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  BarChart3,
  Activity,
  Calculator,
  ShieldCheck,
  ArrowUpRight,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import PrintAccountantStatementButton from "@/components/statements/PrintAccountantStatementButton";
import RevenueChart, { type RevenueDataPoint } from "@/components/dashboard/RevenueChart";
import SparklineChart from "@/components/dashboard/SparklineChart";
import MonthNav from "@/components/accounting/MonthNav";
import type { IncomeEntry, Expense } from "@/types/database";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function AccountingPage({ searchParams }: Props) {
  const { month: monthParam } = await searchParams;
  const supabase = await createClient();

  const now = new Date();
  const currentMonthKey = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
    ? monthParam
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [cmYear, cmMonth] = currentMonthKey.split("-").map(Number);
  const selectedMonthDate = new Date(cmYear, cmMonth - 1, 1);
  const mtdStartDate = `${currentMonthKey}-01`;
  const mtdEndDate = `${currentMonthKey}-31`; // safe upper bound
  const yearStart = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1).toISOString().slice(0, 10);
  const ytdStart = `${now.getFullYear()}-01-01`;

  const [incomeResult, expensesResult, recentIncomeResult, recentExpensesResult, outstandingResult, liabilitiesResult, projectionsResult] = await Promise.all([
    supabase.from("income_entries").select("amount, date, category").gte("date", yearStart),
    supabase.from("expenses").select("amount, date").gte("date", yearStart),
    supabase.from("income_entries").select("id, description, amount, date, category").order("date", { ascending: false }).limit(5),
    supabase.from("expenses").select("id, description, amount, date, category").order("date", { ascending: false }).limit(5),
    supabase.from("invoices").select("amount, paid_amount").in("status", ["sent", "overdue", "partial"]).eq("doc_type", "invoice"),
    supabase.from("liabilities").select("outstanding, status").eq("status", "active"),
    supabase.from("revenue_projections").select("projected_income, projected_expenses, month").gte("month", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`).limit(12),
  ]);

  const incomeEntries = (incomeResult.data ?? []) as Pick<IncomeEntry, "amount" | "date" | "category">[];
  const expenseEntries = (expensesResult.data ?? []) as Pick<Expense, "amount" | "date">[];
  const recentIncome = (recentIncomeResult.data ?? []) as Pick<IncomeEntry, "id" | "description" | "amount" | "date" | "category">[];
  const recentExpenses = (recentExpensesResult.data ?? []) as Pick<Expense, "id" | "description" | "amount" | "date" | "category">[];
  const totalOutstanding = (outstandingResult.data ?? []).reduce(
    (s: number, i: { amount: number; paid_amount: number }) => s + (i.amount - i.paid_amount),
    0
  );

  // Guard: tables may not exist yet in the live DB — fall back to empty arrays
  const liabilitiesData = Array.isArray(liabilitiesResult.data) ? liabilitiesResult.data : [];
  const projectionsData = Array.isArray(projectionsResult.data) ? projectionsResult.data : [];

  const totalLiabilities = liabilitiesData.reduce(
    (s: number, l: { outstanding: number }) => s + l.outstanding,
    0
  );
  const projections12 = projectionsData as { projected_income: number; projected_expenses: number; month: string }[];
  const projMonthsSet = projections12.length;
  const totalProjNet = projections12.reduce((s, p) => s + p.projected_income - p.projected_expenses, 0);

  // MTD (for selected month)
  const incomeMTD = incomeEntries.filter((e) => e.date >= mtdStartDate && e.date <= mtdEndDate).reduce((s, e) => s + e.amount, 0);
  const expensesMTD = expenseEntries.filter((e) => e.date >= mtdStartDate && e.date <= mtdEndDate).reduce((s, e) => s + e.amount, 0);
  const netMTD = incomeMTD - expensesMTD;
  const marginPct = incomeMTD > 0 ? Math.round((netMTD / incomeMTD) * 100) : 0;
  const selectedMonthLabel = selectedMonthDate.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

  // YTD
  const ytdIncome = incomeEntries.filter((e) => e.date >= ytdStart).reduce((s, e) => s + e.amount, 0);
  const ytdExpenses = expenseEntries.filter((e) => e.date >= ytdStart).reduce((s, e) => s + e.amount, 0);
  // Net position: YTD income minus active liabilities (simple proxy)
  const netPosition = ytdIncome - totalLiabilities;

  // Sparkline — daily cumulative income for selected month
  const daysInSelectedMonth = new Date(cmYear, cmMonth, 0).getDate();
  const dailyMap = new Map<string, number>();
  for (let d = 1; d <= daysInSelectedMonth; d++) {
    const key = `${currentMonthKey}-${String(d).padStart(2, "0")}`;
    dailyMap.set(key, 0);
  }
  incomeEntries
    .filter((e) => e.date >= mtdStartDate && e.date <= mtdEndDate)
    .forEach((e) => {
      const day = e.date.slice(0, 10);
      if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + e.amount);
    });
  let cumulative = 0;
  const sparklineData = Array.from(dailyMap.values()).map((v) => {
    cumulative += v;
    return { v: cumulative };
  });

  // 12-month revenue trend
  const orderedMonths: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
    orderedMonths.push({ key, label });
  }
  const revenueMap = new Map<string, { income: number; expenses: number }>(
    orderedMonths.map(({ key }) => [key, { income: 0, expenses: 0 }])
  );
  incomeEntries.forEach((e) => {
    const entry = revenueMap.get(e.date.slice(0, 7));
    if (entry) entry.income += e.amount;
  });
  expenseEntries.forEach((e) => {
    const entry = revenueMap.get(e.date.slice(0, 7));
    if (entry) entry.expenses += e.amount;
  });
  const revenueData: RevenueDataPoint[] = orderedMonths.map(({ key, label }) => ({
    month: label,
    income: revenueMap.get(key)?.income ?? 0,
    expenses: revenueMap.get(key)?.expenses ?? 0,
  }));

  const categoryLabels: Record<string, string> = {
    web_dev: "Web Dev",
    ecommerce: "E-Commerce",
    apps: "Apps",
    training: "Training",
    consulting: "Consulting",
    investment: "Investment",
    hosting: "Hosting",
    software: "Software",
    subscriptions: "Subscriptions",
    hardware: "Hardware",
    marketing: "Marketing",
    transport: "Transport",
    office: "Office",
    professional_services: "Prof. Services",
    other: "Other",
  };

  return (
    <>
      <PageHeader
        title="Accounting"
        description="Income, expenses, and financial overview"
        actions={
          <div className="flex items-center gap-3">
            <MonthNav currentMonth={currentMonthKey} />
            <PrintAccountantStatementButton />
          </div>
        }
      />

      {/* Hero Card */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Net Profit &mdash; {selectedMonthLabel}
            </p>
            <p className={`text-5xl font-bold leading-none ${netMTD >= 0 ? "text-foreground" : "text-red-400"}`}>
              {formatCurrency(Math.abs(netMTD))}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-teal font-medium">{formatCurrency(incomeMTD)} income</span>
              <span>&mdash;</span>
              <span className="text-red-400/80 font-medium">{formatCurrency(expensesMTD)} expenses</span>
            </div>
          </div>

          <div className="w-full md:w-48 shrink-0">
            <p className="text-xs text-gray-600 mb-1 text-center">Income this month</p>
            <SparklineChart data={sparklineData} />
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Margin</p>
            <p className={`text-4xl font-bold ${marginPct >= 0 ? "text-teal" : "text-red-400"}`}>
              {marginPct}%
            </p>
          </div>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          title="Income MTD"
          value={formatCurrency(incomeMTD)}
          sub={selectedMonthLabel}
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          title="Expenses MTD"
          value={formatCurrency(expensesMTD)}
          sub={selectedMonthLabel}
          icon={TrendingDown}
          accent="red"
        />
        <StatCard
          title="YTD Income"
          value={formatCurrency(ytdIncome)}
          sub={`Jan–${now.toLocaleDateString("en-ZA", { month: "short" })}`}
          icon={DollarSign}
          accent="teal"
        />
        <StatCard
          title="YTD Expenses"
          value={formatCurrency(ytdExpenses)}
          sub={`Jan–${now.toLocaleDateString("en-ZA", { month: "short" })}`}
          icon={Receipt}
        />
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <RevenueChart data={revenueData} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Income */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Recent Income
            </h2>
            <Link href="/accounting/income" className="text-xs text-teal hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentIncome.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No income records yet.</p>
          ) : (
            <div className="space-y-1">
              {recentIncome.map((e) => (
                <Link
                  key={e.id}
                  href={`/accounting/income/${e.id}/edit`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-card transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-teal transition-colors truncate">
                      {e.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {categoryLabels[e.category] ?? e.category} &mdash; {formatDate(e.date)}
                    </p>
                  </div>
                  <span className="text-sm font-mono font-medium text-green-400 shrink-0 ml-3">
                    +{formatCurrency(e.amount)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              Recent Expenses
            </h2>
            <Link href="/accounting/expenses" className="text-xs text-teal hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {recentExpenses.map((e) => (
                <Link
                  key={e.id}
                  href={`/accounting/expenses/${e.id}/edit`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-card transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-teal transition-colors truncate">
                      {e.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {categoryLabels[e.category] ?? e.category} &mdash; {formatDate(e.date)}
                    </p>
                  </div>
                  <span className="text-sm font-mono font-medium text-red-400 shrink-0 ml-3">
                    -{formatCurrency(e.amount)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Net Position Banner */}
      <div className={`glass-card p-4 mb-4 flex items-center justify-between ${netPosition >= 0 ? "border-teal/20" : "border-red-500/20"}`}>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Net Position (YTD Income − Active Liabilities)</p>
          <p className={`text-2xl font-bold mt-1 ${netPosition >= 0 ? "text-teal" : "text-red-400"}`}>
            {netPosition >= 0 ? "" : "-"}{formatCurrency(Math.abs(netPosition))}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500 space-y-0.5">
          <p>YTD Income: <span className="text-green-400 font-mono">{formatCurrency(ytdIncome)}</span></p>
          <p>Active Liabilities: <span className="text-red-400 font-mono">{formatCurrency(totalLiabilities)}</span></p>
        </div>
      </div>

      {/* Section Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/accounting/income" className="glass-card p-6 hover:border-teal/30 transition-colors group">
          <div className="flex items-start justify-between mb-3">
            <TrendingUp className="h-7 w-7 text-green-400" />
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-foreground font-semibold">Income</h3>
          <p className="text-sm text-gray-500 mt-1">Track all revenue streams</p>
          <p className="text-xs text-green-400 font-mono font-medium mt-3">{formatCurrency(ytdIncome)} YTD</p>
        </Link>
        <Link href="/accounting/expenses" className="glass-card p-6 hover:border-teal/30 transition-colors group">
          <div className="flex items-start justify-between mb-3">
            <TrendingDown className="h-7 w-7 text-red-400" />
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-foreground font-semibold">Expenses</h3>
          <p className="text-sm text-gray-500 mt-1">Track all business spending</p>
          <p className="text-xs text-red-400 font-mono font-medium mt-3">{formatCurrency(ytdExpenses)} YTD</p>
        </Link>
        <Link href="/accounting/liabilities" className="glass-card p-6 hover:border-teal/30 transition-colors group">
          <div className="flex items-start justify-between mb-3">
            <AlertTriangle className="h-7 w-7 text-orange-400" />
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-foreground font-semibold">Liabilities</h3>
          <p className="text-sm text-gray-500 mt-1">Loans, credit & payables</p>
          <p className={`text-xs font-mono font-medium mt-3 ${totalLiabilities > 0 ? "text-red-400" : "text-gray-600"}`}>
            {formatCurrency(totalLiabilities)} outstanding
          </p>
        </Link>
        <Link href="/accounting/projections" className="glass-card p-6 hover:border-teal/30 transition-colors group">
          <div className="flex items-start justify-between mb-3">
            <CalendarDays className="h-7 w-7 text-teal" />
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-foreground font-semibold">Projections</h3>
          <p className="text-sm text-gray-500 mt-1">12-month revenue forecast</p>
          <p className={`text-xs font-mono font-medium mt-3 ${projMonthsSet > 0 ? (totalProjNet >= 0 ? "text-teal" : "text-red-400") : "text-gray-600"}`}>
            {projMonthsSet > 0 ? `${formatCurrency(Math.abs(totalProjNet))} proj. net` : `${projMonthsSet}/12 months set`}
          </p>
        </Link>
        <Link href="/accounting/cashflow" className="glass-card p-6 hover:border-teal/30 transition-colors group">
          <div className="flex items-start justify-between mb-3">
            <Activity className="h-7 w-7 text-amber-400" />
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-foreground font-semibold">Cash Flow</h3>
          <p className="text-sm text-gray-500 mt-1">Receivables & projections</p>
          <p className={`text-xs font-mono font-medium mt-3 ${totalOutstanding > 0 ? "text-amber-400" : "text-gray-600"}`}>
            {formatCurrency(totalOutstanding)} outstanding
          </p>
        </Link>
        <Link href="/accounting/tax" className="glass-card p-6 hover:border-teal/30 transition-colors group">
          <div className="flex items-start justify-between mb-3">
            <Calculator className="h-7 w-7 text-purple-400" />
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-foreground font-semibold">Tax</h3>
          <p className="text-sm text-gray-500 mt-1">Provisional income tax</p>
          <p className="text-xs text-purple-400/80 font-mono font-medium mt-3">NamRA estimates · 32%</p>
        </Link>
        <Link href="/accounting/reports" className="glass-card p-6 hover:border-teal/30 transition-colors group">
          <div className="flex items-start justify-between mb-3">
            <BarChart3 className="h-7 w-7 text-teal" />
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-foreground font-semibold">Reports</h3>
          <p className="text-sm text-gray-500 mt-1">P&L statements & export</p>
          <p className={`text-xs font-mono font-medium mt-3 ${(ytdIncome - ytdExpenses) >= 0 ? "text-teal" : "text-red-400"}`}>
            {formatCurrency(Math.abs(ytdIncome - ytdExpenses))} net YTD
          </p>
        </Link>
        <Link href="/accounting/audit" className="glass-card p-6 hover:border-teal/30 transition-colors group">
          <div className="flex items-start justify-between mb-3">
            <ShieldCheck className="h-7 w-7 text-blue-400" />
            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors" />
          </div>
          <h3 className="text-foreground font-semibold">Audit</h3>
          <p className="text-sm text-gray-500 mt-1">Unified ledger & review</p>
          <p className="text-xs text-blue-400/80 font-mono font-medium mt-3">All transactions</p>
        </Link>
      </div>
    </>
  );
}
