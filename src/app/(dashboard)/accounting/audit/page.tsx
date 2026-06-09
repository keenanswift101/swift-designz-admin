import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import AuditFilters from "@/components/accounting/AuditFilters";
import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

type IncomeWithInvoice = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  invoice: { invoice_number: string } | null;
};

type AuditEntry = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  reference: string | null;
  receiptUrl: string | null;
  editHref: string;
  flagged: boolean;
};

const incomeCatLabels: Record<string, string> = {
  web_dev: "Web Dev",
  ecommerce: "E-Commerce",
  apps: "Apps",
  training: "Training",
  consulting: "Consulting",
  investment: "Investment",
  other: "Other",
};

const expenseCatLabels: Record<string, string> = {
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

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; flagged?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;

  const [incomeResult, expensesResult] = await Promise.all([
    supabase
      .from("income_entries")
      .select("id, date, description, amount, category, invoice:invoices!invoice_id(invoice_number)")
      .order("date", { ascending: false }),
    supabase
      .from("expenses")
      .select("id, date, description, amount, category, receipt_url")
      .order("date", { ascending: false }),
  ]);

  type RawExpense = { id: string; date: string; description: string; amount: number; category: string; receipt_url: string | null };
  const incomeRaw = (incomeResult.data ?? []) as unknown as IncomeWithInvoice[];
  const expensesRaw = (expensesResult.data ?? []) as RawExpense[];

  // Compute large-transaction threshold: max(2.5x average, R5,000)
  const allAmounts = [
    ...incomeRaw.map((i) => i.amount),
    ...expensesRaw.map((e) => e.amount),
  ];
  const avg =
    allAmounts.length > 0
      ? allAmounts.reduce((s, a) => s + a, 0) / allAmounts.length
      : 0;
  const flagThreshold = Math.max(avg * 2.5, 500000); // R5,000 floor

  const incomeEntries: AuditEntry[] = incomeRaw.map((i) => ({
    id: i.id,
    date: i.date,
    description: i.description,
    category: incomeCatLabels[i.category] ?? i.category,
    type: "income",
    amount: i.amount,
    reference: i.invoice?.invoice_number ?? null,
    receiptUrl: null,
    editHref: `/accounting/income/${i.id}/edit`,
    flagged: i.amount >= flagThreshold,
  }));

  const expenseEntries: AuditEntry[] = expensesRaw.map((e) => ({
    id: e.id,
    date: e.date,
    description: e.description,
    category: expenseCatLabels[e.category] ?? e.category,
    type: "expense",
    amount: e.amount,
    reference: null,
    receiptUrl: e.receipt_url,
    editHref: `/accounting/expenses/${e.id}/edit`,
    flagged: e.amount >= flagThreshold,
  }));

  const allEntries: AuditEntry[] = [
    ...incomeEntries,
    ...expenseEntries,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const flaggedCount = allEntries.filter((e) => e.flagged).length;
  const totalCount = allEntries.length;
  const totalIncome = incomeEntries.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenseEntries.reduce((s, e) => s + e.amount, 0);

  // Apply filters
  const q = sp?.q?.toLowerCase() ?? "";
  const typeFilter = sp?.type ?? "";
  const flaggedOnly = sp?.flagged === "1";

  let filtered = allEntries;
  if (q) filtered = filtered.filter((e) => e.description.toLowerCase().includes(q));
  if (typeFilter === "income") filtered = filtered.filter((e) => e.type === "income");
  if (typeFilter === "expense") filtered = filtered.filter((e) => e.type === "expense");
  if (flaggedOnly) filtered = filtered.filter((e) => e.flagged);

  return (
    <>
      <PageHeader
        title="Audit & Reconciliation"
        description="Unified ledger — search, review, and flag transactions"
        backHref="/accounting"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Entries</p>
          <p className="text-xl font-bold text-foreground">{totalCount}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Income</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Expenses</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Flagged</p>
          <p className={`text-xl font-bold ${flaggedCount > 0 ? "text-amber-400" : "text-gray-600"}`}>
            {flaggedCount}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            large transactions
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden mb-8">
        <Suspense
          fallback={
            <div className="px-5 py-3 border-b border-border text-sm text-gray-500">
              Loading filters...
            </div>
          }
        >
          <AuditFilters
            totalCount={totalCount}
            filteredCount={filtered.length}
            flaggedCount={flaggedCount}
          />
        </Suspense>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  {/* flag */}
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    No entries match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry, i) => (
                  <tr
                    key={`${entry.type}-${entry.id}`}
                    className={`border-b border-border/50 hover:bg-card transition-colors ${
                      entry.flagged ? "bg-amber-950/20" : i % 2 === 1 ? "bg-foreground/3" : ""
                    }`}
                  >
                    {/* Flag indicator */}
                    <td className="px-5 py-2.5 text-center">
                      {entry.flagged && (
                        <AlertTriangle
                          className="h-3.5 w-3.5 text-amber-400 mx-auto"
                          aria-label="Large transaction"
                        />
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-sm text-gray-400 whitespace-nowrap">
                      {formatDate(entry.date)}
                    </td>

                    <td className="px-3 py-2.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          entry.type === "income"
                            ? "bg-teal/10 text-teal"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {entry.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-sm text-foreground max-w-xs">
                      <Link href={entry.editHref} className="hover:text-teal transition-colors truncate block">
                        {entry.description}
                      </Link>
                    </td>

                    <td className="px-3 py-2.5 text-sm text-gray-400">
                      {entry.category}
                    </td>

                    <td
                      className={`px-3 py-2.5 text-sm font-mono font-medium text-right ${
                        entry.type === "income" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {entry.type === "income" ? "+" : "-"}
                      {formatCurrency(entry.amount)}
                    </td>

                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        {entry.reference && (
                          <span className="text-xs font-mono bg-card border border-border px-2 py-0.5 rounded text-gray-400">
                            {entry.reference}
                          </span>
                        )}
                        {entry.receiptUrl && (
                          <a
                            href={entry.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-teal transition-colors"
                            title="View receipt"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {flaggedCount > 0 && (
          <div className="px-5 py-3 bg-amber-950/20 border-t border-amber-400/20 text-xs text-amber-400/80 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {flaggedCount} transaction{flaggedCount !== 1 ? "s" : ""} flagged as large
            (above {formatCurrency(Math.round(flagThreshold))}). Review for accuracy and completeness.
          </div>
        )}
      </div>
    </>
  );
}
