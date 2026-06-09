"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  createCampaignAction,
  updateCampaignAction,
  deleteCampaignAction,
} from "@/app/(dashboard)/marketing/campaigns/actions";
import { useConfirm } from "@/hooks/useConfirm";
import type { MarketingCampaign, CampaignChannel, CampaignStatus, CampaignGoal } from "@/types/marketing";
import { CHANNEL_LABELS, GOAL_LABELS, CAMPAIGN_STATUS_STYLES } from "@/types/marketing";

interface Props { campaigns: MarketingCampaign[] }

const EMPTY: Partial<MarketingCampaign> = {
  name: "", description: "", channel: "social_media", status: "draft",
  goal: undefined, budget_cents: 0, spent_cents: 0,
  start_date: null, end_date: null, target_audience: "", notes: "",
};

export default function CampaignTable({ campaigns }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingCampaign | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const form = editing ?? EMPTY;

  function openNew() { setEditing(null); setError(null); setOpen(true); }
  function openEdit(c: MarketingCampaign) { setEditing(c); setError(null); setOpen(true); }
  function closeModal() { setOpen(false); setEditing(null); }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = editing
        ? await updateCampaignAction(editing.id, fd)
        : await createCampaignAction(fd);
      if ("error" in res) { setError(res.error ?? "Unknown error"); return; }
      closeModal();
    });
  }

  async function handleDelete(c: MarketingCampaign) {
    const ok = await confirm(`Delete campaign "${c.name}"?`, { variant: "danger" });
    if (!ok) return;
    startTransition(async () => {
      await deleteCampaignAction(c.id);
    });
  }

  return (
    <>
      {ConfirmDialog}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-sm font-medium text-foreground">All Campaigns</span>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal text-white text-xs font-medium hover:bg-teal/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Campaign
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            No campaigns yet. Create your first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Channel</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Goal</th>
                  <th className="px-4 py-3 text-right">Budget</th>
                  <th className="px-4 py-3 text-right">Spent</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => {
                  const roiPct = c.budget_cents > 0
                    ? Math.round((c.spent_cents / c.budget_cents) * 100)
                    : 0;
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {c.name}
                        {c.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{c.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{CHANNEL_LABELS[c.channel]}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${CAMPAIGN_STATUS_STYLES[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {c.goal ? GOAL_LABELS[c.goal] : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(c.budget_cents)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={roiPct > 100 ? "text-red-400" : "text-gray-300"}>
                          {formatCurrency(c.spent_cents)}
                        </span>
                        {c.budget_cents > 0 && (
                          <span className="text-xs text-gray-500 ml-1">({roiPct}%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {c.start_date ? c.start_date.slice(0, 10) : "—"}
                        {c.start_date && c.end_date && " → "}
                        {c.end_date ? c.end_date.slice(0, 10) : ""}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-teal transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(c)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              {editing ? "Edit Campaign" : "New Campaign"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Campaign Name *</label>
                  <input name="name" required defaultValue={form.name ?? ""} placeholder="e.g. June Social Push"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Channel</label>
                  <select name="channel" defaultValue={form.channel ?? "social_media"}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    {(Object.entries(CHANNEL_LABELS) as [CampaignChannel, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select name="status" defaultValue={form.status ?? "draft"}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    {(["draft","active","paused","completed"] as CampaignStatus[]).map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Goal</label>
                  <select name="goal" defaultValue={form.goal ?? ""}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    <option value="">— None —</option>
                    {(Object.entries(GOAL_LABELS) as [CampaignGoal, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Budget (N$)</label>
                  <input name="budget" type="number" min="0" step="0.01"
                    defaultValue={form.budget_cents ? (form.budget_cents / 100).toFixed(2) : "0"}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Spent (N$)</label>
                  <input name="spent" type="number" min="0" step="0.01"
                    defaultValue={form.spent_cents ? (form.spent_cents / 100).toFixed(2) : "0"}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                  <input name="start_date" type="date" defaultValue={form.start_date ?? ""}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Date</label>
                  <input name="end_date" type="date" defaultValue={form.end_date ?? ""}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Target Audience</label>
                  <input name="target_audience" defaultValue={form.target_audience ?? ""} placeholder="e.g. SMEs in Namibia"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Description / Notes</label>
                  <textarea name="description" rows={2} defaultValue={form.description ?? ""}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50 resize-none" />
                </div>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-50">
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editing ? "Save Changes" : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
