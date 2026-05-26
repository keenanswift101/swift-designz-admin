import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteAgentButton from "@/components/team/DeleteAgentButton";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { AiAgent } from "@/types/database";
import { Bot } from "lucide-react";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const agent = data as AiAgent;

  return (
    <>
      <PageHeader
        title={agent.name}
        description="AI Agent details"
        backHref="/team/agents"
        actions={
          <div className="flex gap-2">
            <Link
              href={`/team/agents/${agent.id}/edit`}
              className="px-4 py-2 bg-border hover:bg-dark-gray text-foreground text-sm font-medium rounded-lg transition-colors"
            >
              Edit
            </Link>
            <DeleteAgentButton id={agent.id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Agent Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs text-gray-500">Purpose</dt>
                <dd className="text-sm text-foreground mt-1 whitespace-pre-wrap" style={{ overflowWrap: "break-word" }}>{agent.purpose}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Model</dt>
                <dd className="text-sm text-foreground mt-1">{agent.model}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Provider</dt>
                <dd className="text-sm text-foreground mt-1">{agent.provider}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Status</dt>
                <dd className="mt-1"><StatusBadge status={agent.status} /></dd>
              </div>
            </dl>
          </div>

          {agent.config_notes && (
            <div className="glass-card p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Configuration Notes</h2>
              <p className="text-sm text-foreground/60 whitespace-pre-wrap" style={{ overflowWrap: "break-word" }}>{agent.config_notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar cost card */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-teal/10">
                <Bot className="h-5 w-5 text-teal" />
              </div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Cost</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Monthly Cost</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(agent.monthly_cost)}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-gray-500">Annual Cost</p>
                <p className="text-lg font-semibold text-teal">{formatCurrency(agent.monthly_cost * 12)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
