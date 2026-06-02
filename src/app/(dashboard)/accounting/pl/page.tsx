import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { BusinessSettings } from "@/types/database";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

const INCOME_LABELS: Record<string, string> = {
  web_dev: "Web Development",
  ecommerce: "eCommerce",
  investment: "Investment Income",
};

const EXPENSE_LABELS: Record<string, string> = {
  hosting: "Hosting & Infrastructure",
  subscriptions: "Subscriptions & Tools",
  professional_services: "Professional Services",
  marketing: "Marketing & Advertising",
  office: "Office & Admin",
  salaries: "Salaries & Wages",
  equipment: "Equipment",
  other: "Other",
};

const PERIOD_OPTIONS = [
  { value: "financial_year", label: "Financial Year (Mar – Feb)" },
  { value: "prev_financial_year", label: "Previous Financial Year" },
  { value: "ytd", label: "Year to Date (Jan – Now)" },
  { value: "mtd", label: "This Month" },
] as const;

function getDateRange(period: string): { from: string; to: string; label: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (period === "mtd") {
    const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    const label = now.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
    return { from, to: fmt(now), label };
  }

  if (period === "ytd") {
    return {
      from: `${now.getFullYear()}-01-01`,
      to: fmt(now),
      label: `Jan – ${now.toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}`,
    };
  }

  if (period === "prev_financial_year") {
    // Financial year ends last day of February
    const fyEndYear = now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
    const prevFrom = `${fyEndYear - 1}-03-01`;
    const prevTo = `${fyEndYear}-02-28`;
    return { from: prevFrom, to: prevTo, label: `Mar ${fyEndYear - 1} – Feb ${fyEndYear}` };
  }

  // financial_year (default): Mar 1 of last year to Feb 28 of this year OR current date
  {
    const fyStartYear = now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
    const fyEnd = new Date(fyStartYear + 1, 1, 28); // Feb 28
    const to = fyEnd < now ? fmt(fyEnd) : fmt(now);
    return {
      from: `${fyStartYear}-03-01`,
      to,
      label: `Mar ${fyStartYear} – ${fyEnd < now ? `Feb ${fyStartYear + 1}` : now.toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}`,
    };
  }
}

export default async function PLReportPage({ searchParams }: Props) {
  const { period: periodParam } = await searchParams;
  const period = PERIOD_OPTIONS.find((o) => o.value === periodParam)?.value ?? "financial_year";
  const { from, to, label } = getDateRange(period);

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const [{ data: incomeRaw }, { data: expensesRaw }, { data: bizRaw }] = await Promise.all([
    supabase
      .from("income_entries")
      .select("amount, category")
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("expenses")
      .select("amount, category")
      .gte("date", from)
      .lte("date", to),
    adminSupabase.from("business_settings").select("*").limit(1).single(),
  ]);

  const biz = bizRaw as BusinessSettings | null;

  // Group income by category
  const incomeMap = new Map<string, number>();
  for (const row of incomeRaw ?? []) {
    incomeMap.set(row.category, (incomeMap.get(row.category) ?? 0) + row.amount);
  }
  const incomeRows = Array.from(incomeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));

  // Group expenses by category
  const expenseMap = new Map<string, number>();
  for (const row of expensesRaw ?? []) {
    expenseMap.set(row.category, (expenseMap.get(row.category) ?? 0) + row.amount);
  }
  const expenseRows = Array.from(expenseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));

  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
  const isProfit = netProfit >= 0;

  const downloadUrl = `/api/docs/pl-report?period=${period}`;

  return (
    <>
      <div className="mb-5">
        <Link href="/accounting" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Accounting
        </Link>
      </div>

      <PageHeader
        title="Profit & Loss Statement"
        description={`${biz?.company_name ?? "Swift Designz"} · ${label}`}
        actions={
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        }
      />

      {/* Period selector */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {PERIOD_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/accounting/pl?period=${opt.value}`}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              period === opt.value
                ? "bg-teal text-white border-teal"
                : "border-border text-gray-400 hover:border-teal/50 hover:text-foreground"
            }`}
          >
            {opt.label}
          </Link>
        ))}
        <span className="text-xs text-gray-600 ml-2">{from} → {to}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main P&L */}
        <div className="lg:col-span-2 space-y-4">

          {/* INCOME */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal" />
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Income</h2>
              </div>
              <span className="text-sm font-bold text-teal tabular-nums">{formatCurrency(totalIncome)}</span>
            </div>
            {incomeRows.length === 0 ? (
              <p className="px-6 py-6 text-xs text-gray-500 text-center">No income recorded in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {incomeRows.map((row) => (
                    <tr key={row.category} className="hover:bg-card/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-foreground">{INCOME_LABELS[row.category] ?? row.category}</td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-foreground tabular-nums">{formatCurrency(row.amount)}</td>
                      <td className="px-6 py-3 text-right text-xs text-gray-500 tabular-nums w-16">
                        {totalIncome > 0 ? `${Math.round((row.amount / totalIncome) * 100)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-card/30">
                    <td className="px-6 py-3 text-sm font-bold text-foreground">Total Income</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-teal tabular-nums">{formatCurrency(totalIncome)}</td>
                    <td className="px-6 py-3 text-right text-xs text-gray-500">100%</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* EXPENSES */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Operating Expenses</h2>
              </div>
              <span className="text-sm font-bold text-red-400 tabular-nums">{formatCurrency(totalExpenses)}</span>
            </div>
            {expenseRows.length === 0 ? (
              <p className="px-6 py-6 text-xs text-gray-500 text-center">No expenses recorded in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {expenseRows.map((row) => (
                    <tr key={row.category} className="hover:bg-card/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-foreground">{EXPENSE_LABELS[row.category] ?? row.category}</td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-foreground tabular-nums">{formatCurrency(row.amount)}</td>
                      <td className="px-6 py-3 text-right text-xs text-gray-500 tabular-nums w-16">
                        {totalIncome > 0 ? `${Math.round((row.amount / totalIncome) * 100)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-card/30">
                    <td className="px-6 py-3 text-sm font-bold text-foreground">Total Expenses</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-red-400 tabular-nums">{formatCurrency(totalExpenses)}</td>
                    <td className="px-6 py-3 text-right text-xs text-gray-500">
                      {totalIncome > 0 ? `${Math.round((totalExpenses / totalIncome) * 100)}%` : "—"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* NET RESULT */}
          <div className={`glass-card p-6 border ${isProfit ? "border-teal/30" : "border-red-500/30"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {isProfit ? "Net Profit" : "Net Loss"}
                </p>
                <p className={`text-4xl font-bold tabular-nums ${isProfit ? "text-teal" : "text-red-400"}`}>
                  {isProfit ? "" : "(−) "}{formatCurrency(Math.abs(netProfit))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Margin</p>
                <p className={`text-4xl font-bold ${margin >= 0 ? "text-foreground" : "text-red-400"}`}>
                  {margin}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Summary</h2>
            <dl className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <dt className="text-sm text-gray-400">Total Income</dt>
                <dd className="text-sm font-bold text-teal tabular-nums">{formatCurrency(totalIncome)}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <dt className="text-sm text-gray-400">Total Expenses</dt>
                <dd className="text-sm font-bold text-red-400 tabular-nums">{formatCurrency(totalExpenses)}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <dt className="text-sm font-semibold text-foreground">{isProfit ? "Net Profit" : "Net Loss"}</dt>
                <dd className={`text-sm font-bold tabular-nums ${isProfit ? "text-teal" : "text-red-400"}`}>
                  {formatCurrency(Math.abs(netProfit))}
                </dd>
              </div>
              <div className="flex justify-between items-center py-2">
                <dt className="text-sm text-gray-400">Net Margin</dt>
                <dd className="text-sm font-bold text-foreground">{margin}%</dd>
              </div>
            </dl>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Period</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-gray-500">From</dt>
                <dd className="text-sm text-foreground mt-0.5">{from}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">To</dt>
                <dd className="text-sm text-foreground mt-0.5">{to}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Label</dt>
                <dd className="text-sm text-foreground mt-0.5">{label}</dd>
              </div>
            </dl>
          </div>

          {biz && (
            <div className="glass-card p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Entity</h2>
              <dl className="space-y-1.5">
                <dd className="text-sm font-medium text-foreground">{biz.company_name}</dd>
                {biz.address && <dd className="text-xs text-gray-400">{biz.address}</dd>}
                {biz.vat_number && <dd className="text-xs text-gray-400">TIN: {biz.vat_number}</dd>}
                <dd className="text-xs text-gray-500 pt-1">Accounting Officer: Rachel N. Kashala (SAIBA 4132)</dd>
              </dl>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
