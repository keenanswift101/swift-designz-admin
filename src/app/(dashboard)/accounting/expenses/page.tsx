import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteExpenseAction } from "./actions";
import Link from "next/link";
import { Trash2, ExternalLink, RefreshCw, TrendingDown, DollarSign, Hash, Tag } from "lucide-react";
import type { Expense } from "@/types/database";

const categoryLabels: Record<string, string> = {
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

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("id, date, description, amount, category, recurring, recurring_interval, receipt_url")
    .order("date", { ascending: false });

  const entries = (data || []) as Expense[];

  const totalExpenses = entries.reduce((s, e) => s + e.amount, 0);
  const avgExpense = entries.length > 0 ? Math.round(totalExpenses / entries.length) : 0;
  const recurringCount = entries.filter((e) => e.recurring).length;
  const categoryTotals = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const topCategoryKey = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCategory = topCategoryKey ? (categoryLabels[topCategoryKey] ?? topCategoryKey) : "—";

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track all business spending"
        backHref="/accounting"
        actions={
          <Link
            href="/accounting/expenses/new"
            className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Expense
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} sub="All time" icon={TrendingDown} accent="red" />
        <StatCard title="Transactions" value={String(entries.length)} sub="All time" icon={Hash} />
        <StatCard title="Avg Expense" value={formatCurrency(avgExpense)} sub="Per entry" icon={DollarSign} />
        <StatCard title="Top Category" value={topCategory} sub={`${recurringCount} recurring`} icon={Tag} />
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">No expenses recorded yet.</td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="hover:bg-card transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-400">{formatDate(e.date)}</td>
                  <td className="px-5 py-3 text-sm text-foreground">
                    <Link href={`/accounting/expenses/${e.id}/edit`} className="hover:text-teal">
                      {e.description}
                    </Link>
                    {e.recurring && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-gray-500">
                        <RefreshCw className="h-2.5 w-2.5" />
                        {e.recurring_interval}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">{categoryLabels[e.category] || e.category}</td>
                  <td className="px-5 py-3 text-sm text-red-400 text-right font-mono font-medium">{formatCurrency(e.amount)}</td>
                  <td className="px-2 py-3 text-center flex items-center justify-center gap-2">
                    {e.receipt_url && (
                      <a href={e.receipt_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-teal transition-colors" title="View receipt">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <form action={async () => { "use server"; await deleteExpenseAction(e.id); }}>
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
    </>
  );
}
