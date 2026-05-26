import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/auth/actions";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { TrendingUp, DollarSign, Users, PieChart, ArrowUpRight } from "lucide-react";
import type { Investor, IncomeEntry } from "@/types/database";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  prospective: { label: "Prospective", color: "text-amber-400",  bg: "bg-amber-400/10" },
  active:      { label: "Active",      color: "text-teal",       bg: "bg-teal/10" },
  exited:      { label: "Exited",      color: "text-gray-500",   bg: "bg-gray-500/10" },
};

export default async function InvestorsPage() {
  const supabase = await createClient();

  const [{ data: investorsRaw }, { data: contributionsRaw }, profile] = await Promise.all([
    supabase.from("investors").select("*").order("created_at", { ascending: false }),
    supabase.from("income_entries").select("investor_id, amount").eq("source", "investor"),
    getProfile(),
  ]);

  const investors = (investorsRaw ?? []) as Investor[];
  const contributions = (contributionsRaw ?? []) as Pick<IncomeEntry, "investor_id" | "amount">[];

  // Per-investor contributed totals
  const contributedMap = new Map<string, number>();
  for (const c of contributions) {
    if (c.investor_id) {
      contributedMap.set(c.investor_id, (contributedMap.get(c.investor_id) ?? 0) + c.amount);
    }
  }

  // ── Page stats ──────────────────────────────────────────────
  const active = investors.filter((i) => i.status === "active");
  const totalCommitted = investors
    .filter((i) => i.status !== "exited")
    .reduce((s, i) => s + i.investment_amount, 0);
  const totalContributed = Array.from(contributedMap.values()).reduce((s, v) => s + v, 0);
  const totalEquity = active
    .filter((i) => i.equity_percentage)
    .reduce((s, i) => s + (i.equity_percentage ?? 0), 0);
  const fulfilmentRate = totalCommitted > 0 ? Math.round((totalContributed / totalCommitted) * 100) : 0;

  const statusCounts = investors.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Investors"
        description="Investor profiles, agreements, and contributions"
        actions={
          profile?.role === "admin" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/investors/invite"
                className="px-4 py-2 bg-card border border-border hover:border-teal text-gray-400 hover:text-teal text-sm font-medium rounded-lg transition-colors"
              >
                Invite Investor
              </Link>
              <Link
                href="/investors/new"
                className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add Investor
              </Link>
            </div>
          ) : null
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Total Contributed
            </p>
            <p className="text-5xl font-bold leading-none text-teal">{formatCurrency(totalContributed)}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-gray-400 font-medium">{formatCurrency(totalCommitted)} committed</span>
              <span>&mdash;</span>
              <span className={`font-medium ${fulfilmentRate >= 100 ? "text-teal" : "text-amber-400"}`}>
                {fulfilmentRate}% fulfilled
              </span>
            </div>
          </div>

          {/* Commitment progress */}
          <div className="shrink-0 w-full md:w-56">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Commitment fulfilment</span>
              <span className={`font-medium ${fulfilmentRate >= 100 ? "text-teal" : "text-amber-400"}`}>
                {fulfilmentRate}%
              </span>
            </div>
            <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${fulfilmentRate >= 100 ? "bg-teal" : "bg-amber-400"}`}
                style={{ width: `${Math.min(fulfilmentRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{formatCurrency(totalContributed)} in</span>
              <span>{formatCurrency(totalCommitted)} committed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <Users className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-foreground">{investors.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Investors</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalContributed)}</p>
          <p className="text-xs text-gray-500 mt-1">Contributed</p>
        </div>
        <div className="glass-card p-5">
          <TrendingUp className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalCommitted)}</p>
          <p className="text-xs text-gray-500 mt-1">Committed</p>
        </div>
        <div className="glass-card p-5">
          <PieChart className="h-5 w-5 text-purple-400 mb-3" />
          <p className="text-2xl font-bold text-purple-400">
            {totalEquity > 0 ? `${totalEquity.toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Equity Allocated</p>
        </div>
      </div>

      {/* Status pills */}
      {investors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(["active", "prospective", "exited"] as const)
            .filter((s) => (statusCounts[s] ?? 0) > 0)
            .map((s) => {
              const cfg = statusConfig[s];
              return (
                <span
                  key={s}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}
                >
                  {statusCounts[s]} {cfg.label}
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Committed</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Contributed</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Equity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Agreed</th>
              </tr>
            </thead>
            <tbody>
              {investors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                    No investors added yet.
                  </td>
                </tr>
              ) : (
                investors.map((inv, i) => {
                  const contributed = contributedMap.get(inv.id) ?? 0;
                  const pct = inv.investment_amount > 0
                    ? Math.min(Math.round((contributed / inv.investment_amount) * 100), 100)
                    : 0;
                  const isExited = inv.status === "exited";
                  return (
                    <tr
                      key={inv.id}
                      className={`border-b border-border/50 hover:bg-card transition-colors group ${
                        isExited ? "opacity-50" : i % 2 === 1 ? "bg-foreground/3" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/investors/${inv.id}`}
                          className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                        >
                          {inv.name}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                        {inv.email && (
                          <p className="text-xs text-gray-600 mt-0.5">{inv.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {inv.company ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-foreground/60 text-right whitespace-nowrap">
                        {formatCurrency(inv.investment_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 100 ? "bg-teal" : "bg-teal/50"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 text-right">
                        {inv.equity_percentage ? `${inv.equity_percentage}%` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
                        {inv.agreement_date
                          ? new Date(inv.agreement_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
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
