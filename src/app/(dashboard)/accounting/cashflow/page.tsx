import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import CashFlowChart, { type CashFlowDataPoint } from "@/components/accounting/CashFlowChart";
import type { Invoice, IncomeEntry, Expense } from "@/types/database";
import { AlertTriangle } from "lucide-react";

type InvoiceWithClient = Invoice & { client: { name: string } | null };

export default async function CashFlowPage() {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // 12-month window for chart data
  const from12m = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    .toISOString()
    .slice(0, 10);

  const [incomeResult, expensesResult, invoicesResult] = await Promise.all([
    supabase
      .from("income_entries")
      .select("amount, date")
      .gte("date", from12m),
    supabase
      .from("expenses")
      .select("amount, date")
      .gte("date", from12m),
    supabase
      .from("invoices")
      .select("*, client:clients!client_id(name)")
      .eq("doc_type", "invoice")
      .neq("status", "draft")
      .neq("status", "cancelled"),
  ]);

  const income = (incomeResult.data ?? []) as Pick<IncomeEntry, "amount" | "date">[];
  const expenses = (expensesResult.data ?? []) as Pick<Expense, "amount" | "date">[];
  const invoices = (invoicesResult.data ?? []) as InvoiceWithClient[];

  // ── Build 12-month chart data ──────────────────────────────
  const chartMonths: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
    chartMonths.push({ key, label });
  }
  const cashMap = new Map<string, { cashIn: number; cashOut: number }>(
    chartMonths.map(({ key }) => [key, { cashIn: 0, cashOut: 0 }])
  );
  income.forEach((i) => {
    const entry = cashMap.get(i.date.slice(0, 7));
    if (entry) entry.cashIn += i.amount;
  });
  expenses.forEach((e) => {
    const entry = cashMap.get(e.date.slice(0, 7));
    if (entry) entry.cashOut += e.amount;
  });
  let cumulative = 0;
  const cashFlowData: CashFlowDataPoint[] = chartMonths.map(({ key, label }) => {
    const { cashIn, cashOut } = cashMap.get(key) ?? { cashIn: 0, cashOut: 0 };
    const netFlow = cashIn - cashOut;
    cumulative += netFlow;
    return { month: label, cashIn, cashOut, netFlow, cumulative };
  });

  // ── MTD stats ──────────────────────────────────────────────
  const currentMonthKey = today.slice(0, 7);
  const mtdIn = income
    .filter((i) => i.date.slice(0, 7) === currentMonthKey)
    .reduce((s, i) => s + i.amount, 0);
  const mtdOut = expenses
    .filter((e) => e.date.slice(0, 7) === currentMonthKey)
    .reduce((s, e) => s + e.amount, 0);
  const mtdNet = mtdIn - mtdOut;

  // ── Invoice reconciliation ─────────────────────────────────
  const billedStatuses = ["sent", "paid", "partial", "overdue"];
  const sentInvoices = invoices.filter((i) => billedStatuses.includes(i.status));
  const totalBilled = sentInvoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = sentInvoices.reduce((s, i) => s + i.paid_amount, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // ── Aged receivables ───────────────────────────────────────
  const outstanding = invoices.filter((i) =>
    ["sent", "partial", "overdue"].includes(i.status)
  );
  const totalOutstanding = outstanding.reduce(
    (s, i) => s + (i.amount - i.paid_amount),
    0
  );

  const agedBuckets = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
  const agedCounts = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };

  outstanding.forEach((inv) => {
    const owed = inv.amount - inv.paid_amount;
    const daysOverdue = Math.floor(
      (now.getTime() - new Date(inv.due_date).getTime()) / 86400000
    );
    if (daysOverdue <= 0) {
      agedBuckets.current += owed;
      agedCounts.current++;
    } else if (daysOverdue <= 30) {
      agedBuckets.d30 += owed;
      agedCounts.d30++;
    } else if (daysOverdue <= 60) {
      agedBuckets.d60 += owed;
      agedCounts.d60++;
    } else if (daysOverdue <= 90) {
      agedBuckets.d90 += owed;
      agedCounts.d90++;
    } else {
      agedBuckets.d90plus += owed;
      agedCounts.d90plus++;
    }
  });

  // Outstanding invoices table sorted by most overdue first
  const outstandingTable = outstanding
    .map((inv) => ({
      ...inv,
      owed: inv.amount - inv.paid_amount,
      daysOverdue: Math.floor(
        (now.getTime() - new Date(inv.due_date).getTime()) / 86400000
      ),
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  // ── 3-month projection ─────────────────────────────────────
  // Estimate outflow: average of last 3 full months' expenses
  const avgKeys = [-1, -2, -3].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const avgExpenses =
    expenses
      .filter((e) => avgKeys.includes(e.date.slice(0, 7)))
      .reduce((s, e) => s + e.amount, 0) / 3;

  const projectionMonths: { key: string; label: string }[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
    projectionMonths.push({ key, label });
  }

  const projectionData = projectionMonths.map(({ key, label }, i) => {
    const expectedIn = outstanding
      .filter((inv) => inv.due_date.slice(0, 7) === key)
      .reduce((s, inv) => s + (inv.amount - inv.paid_amount), 0);
    const expectedOut = i === 0 ? mtdOut : Math.round(avgExpenses);
    const net = expectedIn - expectedOut;
    return { month: label, expectedIn, expectedOut, net, isCurrent: i === 0 };
  });

  const totalProjectedIn = projectionData.reduce((s, p) => s + p.expectedIn, 0);

  return (
    <>
      <PageHeader
        title="Cash Flow"
        description="Collections, receivables & 3-month projection"
        backHref="/accounting"
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Cash MTD</p>
          <p className={`text-xl font-bold ${mtdNet >= 0 ? "text-teal" : "text-red-400"}`}>
            {mtdNet < 0 ? "-" : ""}{formatCurrency(Math.abs(mtdNet))}
          </p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Outstanding</p>
          <p className="text-xl font-bold text-amber-400">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Collection Rate</p>
          <p
            className={`text-xl font-bold ${
              collectionRate >= 80
                ? "text-teal"
                : collectionRate >= 50
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
          >
            {collectionRate}%
          </p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Projected Inflow</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalProjectedIn)}</p>
          <p className="text-xs text-gray-600 mt-1">next 3 months</p>
        </div>
      </div>

      {/* Cash flow chart */}
      <div className="mb-6">
        <CashFlowChart data={cashFlowData} />
      </div>

      {/* Invoice reconciliation + Aged receivables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Invoice Reconciliation */}
        <div className="glass-card p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Invoice Reconciliation
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-2.5 border-b border-border/50">
              <span className="text-sm text-gray-400">Total Billed</span>
              <span className="text-sm font-mono font-medium text-foreground">
                {formatCurrency(totalBilled)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-border/50">
              <span className="text-sm text-gray-400">Total Collected</span>
              <span className="text-sm font-mono font-medium text-green-400">
                {formatCurrency(totalCollected)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-border/50">
              <span className="text-sm text-gray-400">Outstanding Balance</span>
              <span className="text-sm font-mono font-medium text-amber-400">
                {formatCurrency(totalBilled - totalCollected)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-sm text-gray-400">Collection Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-28 h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      collectionRate >= 80
                        ? "bg-teal"
                        : collectionRate >= 50
                          ? "bg-amber-400"
                          : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(collectionRate, 100)}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-mono font-bold ${
                    collectionRate >= 80
                      ? "text-teal"
                      : collectionRate >= 50
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {collectionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Aged Receivables */}
        <div className="glass-card p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Aged Receivables
          </h2>
          <div className="space-y-0">
            {[
              { label: "Current (not yet due)", amount: agedBuckets.current, count: agedCounts.current, color: "text-teal" },
              { label: "1–30 days overdue", amount: agedBuckets.d30, count: agedCounts.d30, color: "text-amber-400" },
              { label: "31–60 days overdue", amount: agedBuckets.d60, count: agedCounts.d60, color: "text-orange-400" },
              { label: "61–90 days overdue", amount: agedBuckets.d90, count: agedCounts.d90, color: "text-red-400" },
              { label: "90+ days overdue", amount: agedBuckets.d90plus, count: agedCounts.d90plus, color: "text-red-500" },
            ].map(({ label, amount, count, color }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 border-b border-border/30"
              >
                <div>
                  <span className="text-sm text-foreground/60">{label}</span>
                  {count > 0 && (
                    <span className="ml-2 text-xs text-gray-600">({count})</span>
                  )}
                </div>
                <span
                  className={`text-sm font-mono font-medium ${
                    amount > 0 ? color : "text-gray-600"
                  }`}
                >
                  {amount > 0 ? formatCurrency(amount) : "—"}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3">
              <span className="text-sm font-semibold text-foreground">Total Outstanding</span>
              <span className="text-sm font-mono font-bold text-amber-400">
                {formatCurrency(totalOutstanding)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding invoices table */}
      {outstandingTable.length > 0 && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Outstanding Invoices ({outstandingTable.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billed
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {outstandingTable.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={`border-b border-border/50 hover:bg-card ${
                      i % 2 === 1 ? "bg-card/30" : ""
                    }`}
                  >
                    <td className="px-5 py-2.5 text-sm font-mono text-foreground">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-foreground/60">
                      {inv.client?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-mono text-gray-400 text-right">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-mono text-green-400 text-right">
                      {formatCurrency(inv.paid_amount)}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-mono font-semibold text-amber-400 text-right">
                      {formatCurrency(inv.owed)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-400 text-right whitespace-nowrap">
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {inv.daysOverdue > 0 ? (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            inv.daysOverdue > 60
                              ? "bg-red-500/15 text-red-400"
                              : inv.daysOverdue > 30
                                ? "bg-orange-950 text-orange-400"
                                : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {inv.daysOverdue}d overdue
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal/10 text-teal">
                          Due in {Math.abs(inv.daysOverdue)}d
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outstandingTable.length === 0 && (
        <div className="glass-card p-8 text-center mb-6">
          <p className="text-sm text-gray-500">No outstanding invoices. All caught up.</p>
        </div>
      )}

      {/* 3-Month Cash Projection */}
      <div className="glass-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            3-Month Cash Projection
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Inflow from outstanding invoices due each month · Outflow estimated from 3-month expense average
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Inflow
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. Outflow
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-teal uppercase tracking-wider">
                Net Position
              </th>
            </tr>
          </thead>
          <tbody>
            {projectionData.map((row) => (
              <tr key={row.month} className="border-b border-border/50">
                <td className="px-5 py-3 text-sm text-foreground">
                  {row.month}
                  {row.isCurrent && (
                    <span className="ml-2 text-xs text-gray-600 italic">(current)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-green-400 text-right">
                  {row.expectedIn > 0 ? formatCurrency(row.expectedIn) : "—"}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-red-400 text-right">
                  {formatCurrency(row.expectedOut)}
                </td>
                <td
                  className={`px-5 py-3 text-sm font-mono font-semibold text-right ${
                    row.net >= 0 ? "text-teal" : "text-red-400"
                  }`}
                >
                  {row.net < 0 ? "-" : ""}{formatCurrency(Math.abs(row.net))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-card/40 text-xs text-gray-600">
          Today: {new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}Current month uses actuals to date; future months use 3-month rolling expense average.
        </div>
      </div>
    </>
  );
}
