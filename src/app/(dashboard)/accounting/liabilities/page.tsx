import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, CreditCard, DollarSign, TrendingDown, AlertTriangle, Trash2 } from "lucide-react";
import type { Liability, LiabilityType } from "@/types/database";
import { deleteLiabilityAction } from "./actions";

const typeConfig: Record<LiabilityType, { label: string; color: string; bg: string }> = {
  loan:             { label: "Loan",             color: "text-red-400",    bg: "bg-red-400/10" },
  credit_facility:  { label: "Credit Facility",  color: "text-orange-400", bg: "bg-orange-400/10" },
  accounts_payable: { label: "Accounts Payable", color: "text-amber-400",  bg: "bg-amber-400/10" },
  vat_payable:      { label: "VAT Payable",      color: "text-purple-400", bg: "bg-purple-400/10" },
  tax_provision:    { label: "Tax Provision",    color: "text-blue-400",   bg: "bg-blue-400/10" },
  other:            { label: "Other",            color: "text-gray-400",   bg: "bg-gray-500/10" },
};

export default async function LiabilitiesPage() {
  const supabase = await createClient();

  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd = `${now.getFullYear()}-12-31`;

  const [liabilitiesResult, incomeResult] = await Promise.all([
    supabase.from("liabilities").select("*").order("created_at", { ascending: false }),
    supabase.from("income_entries").select("amount").gte("date", yearStart).lte("date", yearEnd),
  ]);

  const liabilities = (liabilitiesResult.data ?? []) as Liability[];
  const ytdIncome = ((incomeResult.data ?? []) as { amount: number }[]).reduce((s, e) => s + e.amount, 0);

  const active = liabilities.filter((l) => l.status === "active");
  const totalOutstanding = active.reduce((s, l) => s + l.outstanding, 0);
  const totalLoans = active.filter((l) => l.type === "loan").reduce((s, l) => s + l.outstanding, 0);
  const totalCredit = active.filter((l) => l.type === "credit_facility").reduce((s, l) => s + l.outstanding, 0);
  const totalPayables = active
    .filter((l) => ["accounts_payable", "vat_payable", "tax_provision"].includes(l.type))
    .reduce((s, l) => s + l.outstanding, 0);

  const debtToIncome = ytdIncome > 0 ? Math.round((totalOutstanding / ytdIncome) * 100) : 0;

  const today = now.toISOString().slice(0, 10);
  const overdue = active.filter((l) => l.due_date && l.due_date < today);

  const typeCounts = active.reduce<Partial<Record<LiabilityType, number>>>((acc, l) => {
    acc[l.type] = (acc[l.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Liabilities"
        description="Loans, credit facilities, and amounts owed"
        backHref="/accounting"
        actions={
          <Link
            href="/accounting/liabilities/new"
            className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Liability
          </Link>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-red-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Total Outstanding
            </p>
            <p className="text-5xl font-bold leading-none text-red-400">{formatCurrency(totalOutstanding)}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-gray-400 font-medium">{active.length} active liabilities</span>
              {overdue.length > 0 && (
                <>
                  <span>&mdash;</span>
                  <span className="text-red-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {overdue.length} overdue
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Debt-to-Income Ratio</p>
            <p className={`text-4xl font-bold ${debtToIncome > 50 ? "text-red-400" : debtToIncome > 30 ? "text-amber-400" : "text-teal"}`}>
              {debtToIncome}%
            </p>
            <p className="text-xs text-gray-600 mt-1">of YTD income</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <TrendingDown className="h-5 w-5 text-red-400 mb-3" />
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalOutstanding)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Outstanding</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-orange-400 mb-3" />
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalLoans)}</p>
          <p className="text-xs text-gray-500 mt-1">Loans</p>
        </div>
        <div className="glass-card p-5">
          <CreditCard className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalCredit)}</p>
          <p className="text-xs text-gray-500 mt-1">Credit Facilities</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-purple-400 mb-3" />
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(totalPayables)}</p>
          <p className="text-xs text-gray-500 mt-1">Payables & Tax</p>
        </div>
      </div>

      {/* Type breakdown pills */}
      {Object.keys(typeCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.entries(typeCounts) as [LiabilityType, number][]).map(([type, count]) => {
            const cfg = typeConfig[type];
            return (
              <span key={type} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                {count} {cfg.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Lender</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {liabilities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">
                    No liabilities recorded yet.
                  </td>
                </tr>
              ) : (
                liabilities.map((l, i) => {
                  const cfg = typeConfig[l.type] ?? typeConfig.other;
                  const isSettled = l.status === "settled";
                  const isOverdue = !isSettled && l.due_date && l.due_date < today;
                  return (
                    <tr
                      key={l.id}
                      className={`border-b border-border/50 hover:bg-card transition-colors group ${
                        isSettled ? "opacity-50" : isOverdue ? "bg-red-500/8" : i % 2 === 1 ? "bg-foreground/3" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/accounting/liabilities/${l.id}/edit`}
                          className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                        >
                          {l.name}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                        {l.notes && <p className="text-xs text-gray-600 mt-0.5 truncate max-w-xs">{l.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{l.lender ?? "—"}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-400 text-right whitespace-nowrap">
                        {formatCurrency(l.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-red-400 text-right whitespace-nowrap">
                        {formatCurrency(l.outstanding)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 text-right">
                        {l.interest_rate != null ? `${l.interest_rate}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {l.due_date ? (
                          <span className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-gray-500"}`}>
                            {formatDate(l.due_date)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <form action={async () => { "use server"; await deleteLiabilityAction(l.id); }}>
                          <button type="submit" className="text-gray-600 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
