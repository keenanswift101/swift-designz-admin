import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Users, TrendingUp, CheckCircle2, Activity, ArrowRight } from "lucide-react";
import type { Lead } from "@/types/database";

const sourceLabels: Record<string, string> = {
  quote_form: "Quote Form",
  contact_form: "Contact Form",
  manual: "Manual",
};

const sourceColors: Record<string, string> = {
  quote_form: "bg-teal/10 text-teal border-teal/20",
  contact_form: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  manual: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const stageOrder = ["new", "contacted", "quoted", "won", "lost"] as const;
const stageConfig: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  new:       { label: "New",       color: "text-blue-400",  bg: "bg-blue-400/10",  bar: "bg-blue-400" },
  contacted: { label: "Contacted", color: "text-amber-400", bg: "bg-amber-400/10", bar: "bg-amber-400" },
  quoted:    { label: "Quoted",    color: "text-purple-400", bg: "bg-purple-400/10", bar: "bg-purple-400" },
  won:       { label: "Won",       color: "text-teal",       bg: "bg-teal/10",       bar: "bg-teal" },
  lost:      { label: "Lost",      color: "text-gray-500",   bg: "bg-gray-500/10",   bar: "bg-gray-500" },
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leads = (data ?? []) as Lead[];

  // ── Pipeline counts ────────────────────────────────────────
  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const total = leads.length;
  const active = (counts.new ?? 0) + (counts.contacted ?? 0) + (counts.quoted ?? 0);
  const won = counts.won ?? 0;
  const lost = counts.lost ?? 0;
  const closed = won + lost;
  const winRate = closed > 0 ? Math.round((won / closed) * 100) : 0;

  // ── Source breakdown ───────────────────────────────────────
  const sourceCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Leads"
        description="Quote requests and contact form submissions"
        actions={
          <Link
            href="/leads/new"
            className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Lead
          </Link>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Total Leads
            </p>
            <p className="text-5xl font-bold leading-none text-foreground">{total}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-teal font-medium">{active} active in pipeline</span>
              <span>&mdash;</span>
              <span className="text-green-400 font-medium">{won} won</span>
              {lost > 0 && (
                <>
                  <span>&mdash;</span>
                  <span className="text-gray-500">{lost} lost</span>
                </>
              )}
            </div>
          </div>

          {/* Win rate */}
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Win Rate</p>
            <p className={`text-4xl font-bold ${winRate >= 50 ? "text-teal" : winRate >= 25 ? "text-amber-400" : "text-gray-400"}`}>
              {closed > 0 ? `${winRate}%` : "—"}
            </p>
            {closed > 0 && (
              <p className="text-xs text-gray-600 mt-1">{won} of {closed} closed</p>
            )}
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <Users className="h-5 w-5 text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-gray-500 mt-1">All Leads</p>
        </div>
        <div className="glass-card p-5">
          <Activity className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{active}</p>
          <p className="text-xs text-gray-500 mt-1">In Pipeline</p>
        </div>
        <div className="glass-card p-5">
          <CheckCircle2 className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-teal">{won}</p>
          <p className="text-xs text-gray-500 mt-1">Won</p>
        </div>
        <div className="glass-card p-5">
          <TrendingUp className="h-5 w-5 text-green-400 mb-3" />
          <p className={`text-2xl font-bold ${winRate >= 50 ? "text-teal" : winRate > 0 ? "text-amber-400" : "text-gray-600"}`}>
            {closed > 0 ? `${winRate}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Win Rate</p>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="glass-card p-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Pipeline</p>
        <div className="flex items-center gap-1 flex-wrap">
          {stageOrder.map((stage, i) => {
            const count = counts[stage] ?? 0;
            const cfg = stageConfig[stage];
            const isLast = i === stageOrder.length - 1;
            const isSeparator = stage === "lost" && i > 0;
            return (
              <div key={stage} className="flex items-center gap-1">
                {isSeparator && (
                  <span className="text-gray-700 text-xs px-1">|</span>
                )}
                {!isSeparator && i > 0 && stage !== "lost" && (
                  <ArrowRight className="h-3.5 w-3.5 text-gray-700 shrink-0" />
                )}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${cfg.bg} border border-transparent`}>
                  <span className={`text-lg font-bold ${cfg.color}`}>{count}</span>
                  <div>
                    <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
                    {total > 0 && (
                      <p className="text-[10px] text-gray-600">{Math.round((count / total) * 100)}%</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage progress bars */}
        {total > 0 && (
          <div className="flex gap-0.5 mt-4 h-1.5 rounded-full overflow-hidden">
            {stageOrder.map((stage) => {
              const count = counts[stage] ?? 0;
              const pct = (count / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={stage}
                  className={`h-full ${stageConfig[stage].bar} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${stageConfig[stage].label}: ${count}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Source pills */}
      {Object.keys(sourceCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(sourceCounts).map(([source, count]) => (
            <span
              key={source}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${sourceColors[source] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}
            >
              {count} {sourceLabels[source] ?? source}
            </span>
          ))}
        </div>
      )}

      {/* Leads table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                    No leads yet. They will appear here when your website forms receive submissions.
                  </td>
                </tr>
              ) : (
                leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className={`border-b border-border/50 hover:bg-card transition-colors ${
                      lead.status === "won"
                        ? "bg-teal/5"
                        : lead.status === "lost"
                          ? "opacity-60"
                          : i % 2 === 1 ? "bg-foreground/3" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm font-medium text-foreground hover:text-teal transition-colors"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {lead.company ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {lead.service ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                          sourceColors[lead.source] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20"
                        }`}
                      >
                        {sourceLabels[lead.source] ?? lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
                      {formatDate(lead.created_at)}
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
