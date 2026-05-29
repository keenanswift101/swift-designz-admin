"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { generateStatementAction } from "@/app/(dashboard)/accounts-receivable/statements/actions";

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface Project {
  id: string;
  name: string;
  client_id: string;
  start_date: string | null;
  due_date: string | null;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function datesForPeriodType(type: string): { from: string; to: string } {
  const now = new Date();
  const today = todayStr();

  if (type === "monthly") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    return { from, to: today };
  }
  if (type === "30_days") {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return { from, to: today };
  }
  if (type === "financial_year") {
    // SA financial year: 1 March – 28/29 Feb
    const year = now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1;
    const from = `${year}-03-01`;
    return { from, to: today };
  }
  // custom / project: keep whatever the user has set
  return { from: "", to: "" };
}

export default function GenerateStatementForm({
  clients,
  projects,
}: {
  clients: Client[];
  projects: Project[];
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const [clientId, setClientId] = useState("");
  const [periodType, setPeriodType] = useState("custom");
  const [projectId, setProjectId] = useState("");
  const [periodFrom, setPeriodFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [periodTo, setPeriodTo] = useState(todayStr());

  const clientProjects = projects.filter((p) => p.client_id === clientId);

  function handlePeriodTypeChange(type: string) {
    setPeriodType(type);
    setProjectId("");
    if (type !== "custom" && type !== "project") {
      const { from, to } = datesForPeriodType(type);
      setPeriodFrom(from);
      setPeriodTo(to);
    }
  }

  function handleProjectChange(id: string) {
    setProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setPeriodFrom(proj.start_date ?? todayStr());
      setPeriodTo(proj.due_date ?? todayStr());
    }
  }

  function handleClientChange(id: string) {
    setClientId(id);
    setProjectId("");
  }

  async function handle(formData: FormData) {
    setLoading(true);
    toast.loading("Generating statement...");
    try {
      const result = await generateStatementAction(formData);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Statement generated.");
        router.push(`/accounts-receivable/statements/${result.statementId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handle} className="space-y-4">
      {/* Hidden controlled values submitted with the form */}
      <input type="hidden" name="period_from" value={periodFrom} />
      <input type="hidden" name="period_to" value={periodTo} />

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Client</label>
        <select
          name="client_id"
          required
          value={clientId}
          onChange={(e) => handleClientChange(e.target.value)}
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
        >
          <option value="">Select client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.company ? ` — ${c.company}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">From</label>
          <input
            type="date"
            value={periodFrom}
            onChange={(e) => setPeriodFrom(e.target.value)}
            required
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">To</label>
          <input
            type="date"
            value={periodTo}
            onChange={(e) => setPeriodTo(e.target.value)}
            required
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Period Type</label>
          <select
            name="period_type"
            value={periodType}
            onChange={(e) => handlePeriodTypeChange(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
          >
            <option value="custom">Custom</option>
            <option value="monthly">Monthly</option>
            <option value="30_days">Last 30 Days</option>
            <option value="financial_year">Financial Year</option>
            <option value="project">Project</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Trigger</label>
          <select
            name="trigger_type"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
          >
            <option value="manual">Manual</option>
            <option value="client_request">Client Request</option>
            <option value="project_closure">Project Closure</option>
            <option value="retainer_monthly">Retainer Monthly</option>
            <option value="reminders_ignored">Reminders Ignored</option>
            <option value="financial_year">Financial Year</option>
          </select>
        </div>
      </div>

      {/* Project picker — shown only when period type is "project" */}
      {periodType === "project" && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Project</label>
          {!clientId ? (
            <p className="text-xs text-gray-600 py-2">Select a client first to see their projects.</p>
          ) : clientProjects.length === 0 ? (
            <p className="text-xs text-gray-600 py-2">No projects found for this client.</p>
          ) : (
            <select
              name="project_id"
              required
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full bg-card border border-teal/40 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
            >
              <option value="">Select project...</option>
              {clientProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.start_date && p.due_date ? ` (${p.start_date} → ${p.due_date})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes (optional)</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Internal note or context for this statement..."
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:border-teal resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || (periodType === "project" && !projectId)}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-teal text-background rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Generate Statement
      </button>
    </form>
  );
}
