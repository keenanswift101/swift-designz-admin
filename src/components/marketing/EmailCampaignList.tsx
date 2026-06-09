"use client";

import { useState, useTransition } from "react";
import { Plus, Send, Trash2, Pencil, Loader2, Eye, X } from "lucide-react";
import {
  createEmailCampaignAction,
  updateEmailCampaignAction,
  deleteEmailCampaignAction,
  sendEmailCampaignAction,
} from "@/app/(dashboard)/marketing/email/actions";
import { useConfirm } from "@/hooks/useConfirm";
import type { EmailCampaign, EmailRecipientType, MarketingCampaign } from "@/types/marketing";

interface Props {
  campaigns: EmailCampaign[];
  marketingCampaigns: Pick<MarketingCampaign, "id" | "name">[];
}

const DEFAULT_HTML = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#30B0B0;">Hello!</h2>
  <p>Write your email content here.</p>
  <p>— The Swift Designz Team</p>
</div>`;

const EMPTY = { name:"", subject:"", body_html: DEFAULT_HTML, body_text:"", recipient_type:"all_clients" as EmailRecipientType, custom_recipients:"", campaign_id:"" };

export default function EmailCampaignList({ campaigns, marketingCampaigns }: Props) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState<EmailCampaign | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { confirm, ConfirmDialog } = useConfirm();

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY });
    setError(null);
    setMessage(null);
    setOpen(true);
  }

  function openEdit(c: EmailCampaign) {
    setEditing(c);
    setForm({
      name:              c.name,
      subject:           c.subject,
      body_html:         c.body_html,
      body_text:         c.body_text,
      recipient_type:    c.recipient_type,
      custom_recipients: (c.custom_recipients ?? []).join("\n"),
      campaign_id:       c.campaign_id ?? "",
    });
    setError(null);
    setMessage(null);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    setError(null);
    startTransition(async () => {
      const res = editing
        ? await updateEmailCampaignAction(editing.id, fd)
        : await createEmailCampaignAction(fd);
      if ("error" in res) { setError(res.error ?? "Unknown error"); return; }
      setOpen(false);
    });
  }

  async function handleSend(c: EmailCampaign) {
    const ok = await confirm(
      `Send "${c.name}" to all ${c.recipient_type === "all_clients" ? "clients" : c.recipient_type === "all_leads" ? "leads" : "custom recipients"}? This cannot be undone.`,
      { variant: "send" }
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await sendEmailCampaignAction(c.id);
      if ("error" in res) {
        alert(res.error);
      } else if ("ok" in res) {
        setMessage(`Sent to ${res.sent} recipients${res.failed ? ` (${res.failed} failed)` : ""}.`);
      }
    });
  }

  async function handleDelete(c: EmailCampaign) {
    const ok = await confirm(`Delete "${c.name}"?`, { variant: "danger" });
    if (!ok) return;
    startTransition(async () => { await deleteEmailCampaignAction(c.id); });
  }

  return (
    <>
      {ConfirmDialog}

      {message && (
        <div className="glass-card p-3 border border-teal/20 text-sm text-teal flex items-center justify-between">
          {message}
          <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-sm font-medium text-foreground">All Email Campaigns</span>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal text-white text-xs font-medium hover:bg-teal/80 transition-colors">
            <Plus className="h-3.5 w-3.5" /> New Campaign
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">No email campaigns yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {campaigns.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.subject}</p>
                </div>
                <div className="text-xs text-gray-500 shrink-0">
                  {c.recipient_type === "all_clients" ? "All Clients"
                    : c.recipient_type === "all_leads" ? "All Leads"
                    : `Custom (${(c.custom_recipients ?? []).length})`}
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                  c.status === "sent"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                }`}>
                  {c.status === "sent" ? `Sent — ${c.recipient_count} recipients` : "Draft"}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status === "draft" && (
                    <>
                      <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-teal transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleSend(c)} disabled={isPending} className="text-gray-500 hover:text-teal transition-colors" title="Send">
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(c)} className="text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Builder modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {editing ? "Edit Email Campaign" : "New Email Campaign"}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview((p) => !p)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
                    preview ? "border-teal/40 text-teal bg-teal/10" : "border-border text-gray-400 hover:text-foreground"
                  }`}>
                  <Eye className="h-3 w-3" /> Preview
                </button>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {preview ? (
              <div className="bg-white rounded-lg overflow-hidden">
                <iframe
                  srcDoc={form.body_html}
                  className="w-full h-[400px] border-0"
                  title="Email Preview"
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Campaign Name *</label>
                    <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. June Newsletter"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Subject Line *</label>
                    <input required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="e.g. Exciting news from Swift Designz"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Recipients</label>
                  <div className="flex gap-4">
                    {(["all_clients","all_leads","custom"] as EmailRecipientType[]).map((t) => (
                      <label key={t} className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer">
                        <input type="radio" name="recipient_type" value={t}
                          checked={form.recipient_type === t}
                          onChange={() => setForm((f) => ({ ...f, recipient_type: t }))}
                          className="accent-teal" />
                        {t === "all_clients" ? "All Clients" : t === "all_leads" ? "All Leads" : "Custom List"}
                      </label>
                    ))}
                  </div>
                </div>

                {form.recipient_type === "custom" && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email Addresses (one per line or comma-separated)</label>
                    <textarea rows={3} value={form.custom_recipients}
                      onChange={(e) => setForm((f) => ({ ...f, custom_recipients: e.target.value }))}
                      placeholder="client@example.com&#10;another@example.com"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50 resize-none font-mono text-xs" />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email Body (HTML)</label>
                  <textarea rows={10} value={form.body_html}
                    onChange={(e) => setForm((f) => ({ ...f, body_html: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50 resize-y font-mono text-xs"
                    spellCheck={false} />
                  <p className="text-xs text-gray-500 mt-1">Write HTML or plain text. Use the Preview button to check rendering.</p>
                </div>

                {marketingCampaigns.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Link to Campaign (optional)</label>
                    <select value={form.campaign_id} onChange={(e) => setForm((f) => ({ ...f, campaign_id: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                      <option value="">— None —</option>
                      {marketingCampaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {error && <p className="text-xs text-red-400">{error}</p>}

                <div className="flex gap-2 justify-end pt-1">
                  <button type="button" onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-50">
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {editing ? "Save Draft" : "Create Draft"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
