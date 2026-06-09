import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Trophy,
  AlertCircle,
  Calendar,
  RefreshCw,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { RevenueDataPoint } from "@/components/dashboard/RevenueChart";
import type { DonutDataPoint } from "@/components/dashboard/RevenueDonutChart";

const RevenueChart = dynamic(() => import("@/components/dashboard/RevenueChart"));
const RevenueDonutChart = dynamic(() => import("@/components/dashboard/RevenueDonutChart"));
const SparklineChart = dynamic(() => import("@/components/dashboard/SparklineChart"));

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const mtdStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const yearStart = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1).toISOString();

  const next30 = new Date(now);
  next30.setDate(next30.getDate() + 30);

  const [
    { count: newLeadsCount },
    { count: activeProjectsCount },
    { count: clientsCount },
    { count: overdueCount },
    { data: unpaidInvoices },
    { data: recentLeads },
    { data: incomeEntries },
    { data: expenseEntries },
    { data: allLeads },
    { data: activeProjectsList },
    { data: activeRetainers },
    { data: recentPayments },
    { data: recentRetainerPayments },
    { data: upcomingQuotations },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("invoices").select("*", { count: "exact", head: true }).eq("status", "overdue"),
    supabase.from("invoices").select("amount, paid_amount").in("status", ["sent", "partial", "overdue"]),
    supabase.from("leads").select("id, name, email, service, status, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("income_entries").select("amount, date, category").gte("date", yearStart.slice(0, 10)),
    supabase.from("expenses").select("amount, date").gte("date", yearStart.slice(0, 10)),
    supabase.from("leads").select("status"),
    supabase
      .from("projects")
      .select("id, name, progress_override, due_date, status")
      .eq("status", "in_progress")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(6),
    // Retainer MRR
    supabase.from("retainer_subscriptions").select("monthly_amount").eq("status", "active"),
    // Cash collected MTD from invoice payments
    supabase.from("payments").select("amount, paid_at").gte("paid_at", mtdStartDate),
    // Cash collected MTD from retainer payments
    supabase.from("retainer_payments").select("amount, payment_date").gte("payment_date", mtdStartDate),
    // Quotations with upcoming payment plan installments (next 30 days)
    supabase
      .from("quotations")
      .select("id, quote_number, payment_plan_schedule, clients(name)")
      .eq("status", "converted")
      .eq("payment_plan_enabled", true)
      .not("payment_plan_schedule", "is", null),
  ]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const outstandingAmount = (unpaidInvoices || []).reduce(
    (sum, inv) => sum + (inv.amount - inv.paid_amount),
    0
  );

  const incomeMTD = (incomeEntries || [])
    .filter((e) => e.date >= mtdStartDate)
    .reduce((s, e) => s + e.amount, 0);

  const expensesMTD = (expenseEntries || [])
    .filter((e) => e.date >= mtdStartDate)
    .reduce((s, e) => s + e.amount, 0);

  const netRevenueMTD = incomeMTD - expensesMTD;
  const marginPct = incomeMTD > 0 ? Math.round((netRevenueMTD / incomeMTD) * 100) : 0;

  const wonLeads = (allLeads || []).filter((l) => l.status === "won").length;
  const closedLeads = (allLeads || []).filter((l) => l.status === "won" || l.status === "lost").length;
  const winRate = closedLeads > 0 ? Math.round((wonLeads / closedLeads) * 100) : 0;

  // Retainer MRR
  const retainerMRR = (activeRetainers || []).reduce((s, r) => s + r.monthly_amount, 0);

  // Cash actually collected MTD (invoice payments + retainer payments)
  const invoiceCashMTD = (recentPayments || []).reduce((s, p) => s + p.amount, 0);
  const retainerCashMTD = (recentRetainerPayments || []).reduce((s, p) => s + p.amount, 0);
  const cashCollectedMTD = invoiceCashMTD + retainerCashMTD;

  // Upcoming installments due in next 30 days (from converted quotations with payment plans)
  type UpcomingInstallment = {
    quoteNumber: string;
    clientName: string;
    label: string;
    amount: number;
    dueDate: string;
  };
  const todayStr = now.toISOString().slice(0, 10);
  const next30Str = next30.toISOString().slice(0, 10);

  const upcomingInstallments: UpcomingInstallment[] = [];
  for (const q of (upcomingQuotations || []) as unknown as {
    id: string; quote_number: string;
    payment_plan_schedule: { label: string; amount_cents?: number; amount?: number; due_date?: string; installment_number?: number }[] | null;
    clients: { name: string } | null;
  }[]) {
    if (!q.payment_plan_schedule) continue;
    for (const entry of q.payment_plan_schedule) {
      if (!entry.due_date) continue;
      if (entry.due_date >= todayStr && entry.due_date <= next30Str) {
        upcomingInstallments.push({
          quoteNumber: q.quote_number,
          clientName: q.clients?.name ?? "—",
          label: entry.label,
          amount: entry.amount_cents ?? entry.amount ?? 0,
          dueDate: entry.due_date,
        });
      }
    }
  }
  upcomingInstallments.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Daily cumulative income sparkline for this month
  const daysInMonth = now.getDate();
  const dailyMap = new Map<string, number>();
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dailyMap.set(key, 0);
  }
  (incomeEntries || [])
    .filter((e) => e.date >= mtdStartDate)
    .forEach((e) => {
      const day = e.date.slice(0, 10);
      if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + e.amount);
    });
  let cumulative = 0;
  const sparklineData = Array.from(dailyMap.values()).map((v) => {
    cumulative += v;
    return { v: cumulative };
  });

  // Income by category for donut (12-month)
  const categoryMap = new Map<string, number>();
  (incomeEntries || []).forEach((e) => {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + e.amount);
  });
  const donutData: DonutDataPoint[] = Array.from(categoryMap.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([category, value]) => ({ category, value }));

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
  (incomeEntries || []).forEach((e) => {
    const entry = revenueMap.get(e.date.slice(0, 7));
    if (entry) entry.income += e.amount;
  });
  (expenseEntries || []).forEach((e) => {
    const entry = revenueMap.get(e.date.slice(0, 7));
    if (entry) entry.expenses += e.amount;
  });
  const revenueData: RevenueDataPoint[] = orderedMonths.map(({ key, label }) => ({
    month: label,
    income: revenueMap.get(key)?.income ?? 0,
    expenses: revenueMap.get(key)?.expenses ?? 0,
  }));

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your business at a glance" />

      {/* ── Hero Card ───────────────────────────────────────────────────── */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Primary stat */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Net Revenue — Month to Date
            </p>
            <p className={`text-5xl font-bold leading-none ${netRevenueMTD >= 0 ? "text-foreground" : "text-red-400"}`}>
              {formatCurrency(netRevenueMTD)}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-teal font-medium">{formatCurrency(incomeMTD)} income</span>
              <span>&mdash;</span>
              <span className="text-red-400/80 font-medium">{formatCurrency(expensesMTD)} expenses</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="w-full md:w-48 shrink-0">
            <p className="text-xs text-gray-600 mb-1 text-center">Income this month</p>
            <SparklineChart data={sparklineData} />
          </div>

          {/* Margin + MRR */}
          <div className="text-right shrink-0 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Margin</p>
              <p className={`text-4xl font-bold ${marginPct >= 0 ? "text-teal" : "text-red-400"}`}>
                {marginPct}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cash Collected MTD</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(cashCollectedMTD)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7-stat compact grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatCard
          title="New Leads"
          value={String(newLeadsCount ?? 0)}
          sub="Awaiting response"
          icon={Users}
          accent="teal"
        />
        <StatCard
          title="Active Projects"
          value={String(activeProjectsCount ?? 0)}
          sub="In progress"
          icon={Briefcase}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(outstandingAmount)}
          sub="Unpaid invoices"
          icon={FileText}
          accent={outstandingAmount > 0 ? "amber" : "default"}
        />
        <StatCard
          title="Retainer MRR"
          value={formatCurrency(retainerMRR)}
          sub={`${(activeRetainers || []).length} active retainer${(activeRetainers || []).length !== 1 ? "s" : ""}`}
          icon={RefreshCw}
          accent={retainerMRR > 0 ? "teal" : "default"}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          sub={closedLeads > 0 ? `${wonLeads} of ${closedLeads} closed` : "No closed leads"}
          icon={Trophy}
          accent={winRate >= 50 ? "green" : winRate > 0 ? "amber" : "default"}
        />
        <StatCard
          title="Total Clients"
          value={String(clientsCount ?? 0)}
          sub="All time"
          icon={TrendingUp}
        />
        <StatCard
          title="Overdue"
          value={String(overdueCount ?? 0)}
          sub="Overdue invoices"
          icon={AlertCircle}
          accent={(overdueCount ?? 0) > 0 ? "red" : "default"}
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueDonutChart data={donutData} />
        </div>
        <div className="lg:col-span-3">
          <RevenueChart data={revenueData} />
        </div>
      </div>

      {/* ── Upcoming installments ───────────────────────────────────────── */}
      {upcomingInstallments.length > 0 && (
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Upcoming Payment Plan Installments
              <span className="text-xs text-gray-500 font-normal">— next 30 days</span>
            </h2>
            <Link href="/accounts-receivable/payments" className="text-xs text-teal hover:underline">
              View payments
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingInstallments.map((inst, i) => (
              <div key={i} className="flex items-center justify-between bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inst.clientName}</p>
                  <p className="text-xs text-gray-500 truncate">{inst.label} · {inst.quoteNumber}</p>
                  <p className="text-xs text-amber-400 mt-0.5">{formatDate(inst.dueDate)}</p>
                </div>
                <p className="text-sm font-bold text-amber-400 tabular-nums ml-3 shrink-0">{formatCurrency(inst.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Activity row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-teal" />
              Recent Leads
            </h2>
            <Link href="/leads" className="text-xs text-teal hover:underline">
              View all
            </Link>
          </div>
          {(recentLeads?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No leads yet.
            </p>
          ) : (
            <div className="space-y-1">
              {recentLeads!.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-card transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-teal transition-colors truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {lead.service || lead.email} &mdash; {formatDate(lead.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={lead.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-teal" />
              Active Projects
            </h2>
            <Link href="/projects" className="text-xs text-teal hover:underline">
              View all
            </Link>
          </div>
          {(activeProjectsList?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No active projects.
            </p>
          ) : (
            <div className="space-y-4">
              {activeProjectsList!.map((project) => {
                const progress = project.progress_override ?? null;
                const isOverdue =
                  project.due_date && new Date(project.due_date) < now;

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-foreground group-hover:text-teal transition-colors truncate pr-2">
                        {project.name}
                      </p>
                      {project.due_date && (
                        <div className={`flex items-center gap-1 shrink-0 text-xs ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
                          <Calendar className="h-3 w-3" />
                          {formatDate(project.due_date)}
                        </div>
                      )}
                    </div>
                    {progress !== null ? (
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">No progress tracked</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
