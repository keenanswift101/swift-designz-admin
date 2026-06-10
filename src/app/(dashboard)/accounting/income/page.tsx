import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteIncomeAction } from "./actions";
import ReconcileToggle from "@/components/accounting/ReconcileToggle";
import MonthFilter from "@/components/accounting/MonthFilter";
import Link from "next/link";
import { Trash2, TrendingUp, Hash, Tag, CheckCircle2, Receipt } from "lucide-react";
import type { IncomeEntry } from "@/types/database";
import { Suspense } from "react";

const categoryLabels: Record<string, string> = {
  web_dev: "Web Dev",
  ecommerce: "E-Commerce",
  apps: "Apps",
  training: "Training",
  consulting: "Consulting",
  investment: "Investment",
  other: "Other",
};

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("income_entries")
    .select("id, date, description, amount, category, reconciled, source, invoice_id")
    .order("date", { ascending: false });

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const from = `${month}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const to = `${month}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("date", from).lte("date", to);
  }

  const { data } = await query;

  const entries = (data ?? []) as IncomeEntry[];

  const totalIncome = entries.reduce((s, e) => s + e.amount, 0);
  const reconciledEntries = entries.filter((e) => e.reconciled);
  const reconciledTotal = reconciledEntries.reduce((s, e) => s + e.amount, 0);
  const reconciledPct = entries.length > 0
    ? Math.round((reconciledEntries.length / entries.length) * 100)
    : 0;
  const categoryTotals = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const topCategoryKey = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCategory = topCategoryKey ? (categoryLabels[topCategoryKey] ?? topCategoryKey) : "—";

  return (
    <>
      <PageHeader
        title="Income"
        description={month ? `Filtered: ${new Date(`${month}-01`).toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}` : "All revenue records"}
        backHref="/accounting"
        actions={
          <div className="flex items-center gap-3">
            <Suspense>
              <MonthFilter />
            </Suspense>
            <Link
              href="/accounting/income/new"
              className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Income
            </Link>
          </div>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Income</p>
            <p className="text-5xl font-bold leading-none text-green-400">{formatCurrency(totalIncome)}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-teal font-medium">{reconciledEntries.length} of {entries.length} reconciled</span>
              <span>&mdash;</span>
              <span className={`font-medium ${reconciledPct === 100 ? "text-teal" : "text-amber-400"}`}>
                {formatCurrency(reconciledTotal)} verified
              </span>
            </div>
          </div>
          {/* Reconciliation progress */}
          <div className="shrink-0 w-full md:w-52">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Reconciliation</span>
              <span className={`font-medium ${reconciledPct === 100 ? "text-teal" : "text-amber-400"}`}>
                {reconciledPct}%
              </span>
            </div>
            <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${reconciledPct === 100 ? "bg-teal" : "bg-amber-400"}`}
                style={{ width: `${reconciledPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{reconciledEntries.length} of {entries.length} entries</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <TrendingUp className="h-5 w-5 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Income</p>
        </div>
        <div className="glass-card p-5">
          <CheckCircle2 className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-teal">{formatCurrency(reconciledTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">Reconciled</p>
        </div>
        <div className="glass-card p-5">
          <Hash className="h-5 w-5 text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-foreground">{entries.length}</p>
          <p className="text-xs text-gray-500 mt-1">Transactions</p>
        </div>
        <div className="glass-card p-5">
          <Tag className="h-5 w-5 text-purple-400 mb-3" />
          <p className="text-2xl font-bold text-foreground">{topCategory}</p>
          <p className="text-xs text-gray-500 mt-1">Top Category</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Reconciled">✓</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="w-10 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Invoice">Inv</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">No income records yet.</td>
                </tr>
              ) : (
                entries.map((e, i) => (
                  <tr
                    key={e.id}
                    className={`border-b border-border/50 hover:bg-card transition-colors ${
                      !e.reconciled ? "bg-amber-950/10" : i % 2 === 1 ? "bg-foreground/3" : ""
                    }`}
                  >
                    <td className="px-3 py-3 text-center">
                      <ReconcileToggle id={e.id} reconciled={e.reconciled} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <Link href={`/accounting/income/${e.id}/edit`} className="hover:text-teal transition-colors">
                        {e.description}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{categoryLabels[e.category] ?? e.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{e.source}</td>
                    <td className="px-4 py-3 text-sm text-green-400 text-right font-mono font-medium whitespace-nowrap">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="px-2 py-3 text-center">
                      {e.invoice_id ? (
                        <Link
                          href={`/invoices/${e.invoice_id}`}
                          className="inline-flex items-center justify-center text-teal hover:text-teal/70 transition-colors"
                          title="View linked invoice"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <span className="text-gray-700 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <form action={async () => { "use server"; await deleteIncomeAction(e.id); }}>
                        <button type="submit" className="text-gray-600 hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
