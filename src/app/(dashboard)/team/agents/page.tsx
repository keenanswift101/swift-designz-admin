import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { AiAgent } from "@/types/database";
import { Bot, DollarSign, TrendingUp, PauseCircle, ArrowUpRight } from "lucide-react";

const providerConfig: Record<string, { color: string; bg: string }> = {
  anthropic: { color: "text-orange-400",  bg: "bg-orange-400/10" },
  openai:    { color: "text-green-400",   bg: "bg-green-400/10" },
  google:    { color: "text-blue-400",    bg: "bg-blue-400/10" },
  mistral:   { color: "text-purple-400",  bg: "bg-purple-400/10" },
  meta:      { color: "text-blue-300",    bg: "bg-blue-300/10" },
  other:     { color: "text-gray-400",    bg: "bg-gray-500/10" },
};

function providerCfg(provider: string) {
  const key = provider.toLowerCase();
  return providerConfig[key] ?? providerConfig.other;
}

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: agentsRaw } = await supabase
    .from("ai_agents")
    .select("*")
    .order("name");

  const agents = (agentsRaw ?? []) as AiAgent[];
  const active = agents.filter((a) => a.status === "active");
  const paused = agents.filter((a) => a.status === "paused");
  const totalMonthly = active.reduce((s, a) => s + a.monthly_cost, 0);
  const avgCost = active.length > 0 ? Math.round(totalMonthly / active.length) : 0;

  const providerCounts = agents
    .filter((a) => a.status === "active")
    .reduce<Record<string, number>>((acc, a) => {
      const key = a.provider.toLowerCase();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

  return (
    <>
      <PageHeader
        title="AI Agents"
        description="Your AI assistants and their configurations"
        backHref="/team"
        actions={
          <Link
            href="/team/agents/new"
            className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Agent
          </Link>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Monthly AI Spend
            </p>
            <p className="text-5xl font-bold leading-none text-blue-400">{formatCurrency(totalMonthly)}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-teal font-medium">{active.length} active</span>
              <span>&mdash;</span>
              <span className="text-gray-400 font-medium">{formatCurrency(avgCost)} avg per agent</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Annual AI Spend</p>
            <p className="text-4xl font-bold text-teal">{formatCurrency(totalMonthly * 12)}</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <Bot className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-foreground">{agents.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Agents</p>
        </div>
        <div className="glass-card p-5">
          <Bot className="h-5 w-5 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-green-400">{active.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalMonthly)}</p>
          <p className="text-xs text-gray-500 mt-1">Monthly Cost</p>
        </div>
        <div className="glass-card p-5">
          <TrendingUp className="h-5 w-5 text-purple-400 mb-3" />
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(totalMonthly * 12)}</p>
          <p className="text-xs text-gray-500 mt-1">Annual Cost</p>
        </div>
      </div>

      {/* Provider breakdown pills */}
      {Object.keys(providerCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(providerCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([provider, count]) => {
              const cfg = providerCfg(provider);
              return (
                <span
                  key={provider}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${cfg.bg} ${cfg.color}`}
                >
                  {count} {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </span>
              );
            })}
          {paused.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400">
              <PauseCircle className="h-3 w-3" />
              {paused.length} paused
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/mo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                    No AI agents registered yet.
                  </td>
                </tr>
              ) : (
                agents.map((agent, i) => {
                  const isInactive = agent.status !== "active";
                  const pCfg = providerCfg(agent.provider);
                  return (
                    <tr
                      key={agent.id}
                      className={`border-b border-border/50 hover:bg-card transition-colors group ${
                        isInactive ? "opacity-50" : i % 2 === 1 ? "bg-foreground/3" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/team/agents/${agent.id}`}
                          className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                        >
                          {agent.name}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                        {agent.purpose}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${pCfg.bg} ${pCfg.color}`}>
                          {agent.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                        {agent.model}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-foreground text-right whitespace-nowrap">
                        {formatCurrency(agent.monthly_cost)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={agent.status} />
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
