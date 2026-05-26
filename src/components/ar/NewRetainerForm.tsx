"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { createRetainerSubscriptionAction } from "@/app/(dashboard)/accounts-receivable/retainers/actions";

interface Client {
  id: string;
  name: string;
  company: string | null;
}

export default function NewRetainerForm({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const toast = useToast();

  const today = new Date().toISOString().split("T")[0];

  async function handle(formData: FormData) {
    setLoading(true);
    toast.loading("Creating retainer...");
    try {
      const result = await createRetainerSubscriptionAction(formData);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Retainer subscription created.");
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal text-background rounded-lg hover:bg-teal/90 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        New Retainer
      </button>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">New Retainer Subscription</h2>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
      <form ref={formRef} action={handle} className="space-y-4">
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

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Retainer Name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. eStore Retainer — Client Name"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:border-teal"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Monthly Amount (R)</label>
            <input
              type="number"
              name="monthly_amount"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:border-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Billing Day</label>
            <select
              name="billing_day"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
            >
              <option value="1">1st of month</option>
              <option value="28">28th (or last)</option>
              <option value="29">29th (or last)</option>
              <option value="30">30th (or last)</option>
              <option value="31">Last day</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Start Date</label>
            <input
              type="date"
              name="start_date"
              defaultValue={today}
              required
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">End Date (optional)</label>
            <input
              type="date"
              name="end_date"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes (optional)</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Internal notes..."
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:border-teal resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-teal text-background rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Retainer
        </button>
      </form>
    </div>
  );
}
