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

export default function GenerateStatementForm({ clients }: { clients: Client[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

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

  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  return (
    <form action={handle} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Client</label>
        <select
          name="client_id"
          required
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
            name="period_from"
            defaultValue={firstOfMonth}
            required
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">To</label>
          <input
            type="date"
            name="period_to"
            defaultValue={today}
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
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-teal text-background rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Generate Statement
      </button>
    </form>
  );
}
