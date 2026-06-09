"use client";

import { useState, useTransition } from "react";
import { UserPlus, Trash2, UserX, Loader2, X, Link2 } from "lucide-react";
import { addSubscriberAction, unsubscribeAction, deleteSubscriberAction } from "@/app/(dashboard)/marketing/email/subscriber-actions";
import { useConfirm } from "@/hooks/useConfirm";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "unsubscribed";
  source: "manual" | "public_form";
  subscribed_at: string;
}

interface Props {
  subscribers: Subscriber[];
}

const SOURCE_LABELS: Record<string, string> = {
  manual:      "Manual",
  public_form: "Subscribe page",
};

export default function SubscriberList({ subscribers }: Props) {
  const [showAdd, setShowAdd]   = useState(false);
  const [email, setEmail]       = useState("");
  const [name, setName]         = useState("");
  const [err, setErr]           = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [isPending, startTransition] = useTransition();
  const { confirm, ConfirmDialog }   = useConfirm();

  const subscribeUrl = `${typeof window !== "undefined" ? window.location.origin : "https://admin.swiftdesignz.co.za"}/subscribe`;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("name", name);
    startTransition(async () => {
      const res = await addSubscriberAction(fd);
      if ("error" in res) { setErr(res.error); return; }
      setEmail(""); setName(""); setShowAdd(false);
    });
  }

  function handleUnsubscribe(id: string, email: string) {
    startTransition(async () => {
      const ok = await confirm(`Mark ${email} as unsubscribed?`, { variant: "warning" });
      if (!ok) return;
      await unsubscribeAction(id);
    });
  }

  function handleDelete(id: string, email: string) {
    startTransition(async () => {
      const ok = await confirm(`Delete ${email} permanently?`, { variant: "danger" });
      if (!ok) return;
      await deleteSubscriberAction(id);
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(subscribeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const active       = subscribers.filter((s) => s.status === "active").length;
  const unsubscribed = subscribers.filter((s) => s.status === "unsubscribed").length;

  return (
    <>
      {ConfirmDialog}

      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-medium text-foreground">Newsletter Subscribers</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {active} active · {unsubscribed} unsubscribed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-gray-400 hover:text-teal hover:border-teal/30 transition-colors"
              title="Copy public subscribe link"
            >
              <Link2 className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Subscribe link"}
            </button>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-teal/30 text-teal hover:bg-teal/10 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add subscriber
            </button>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="px-5 py-4 border-b border-border bg-card/40 flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className="block text-xs text-gray-500 mb-1">Email *</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="subscriber@example.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50"
              />
            </div>
            <div className="flex-1 min-w-32">
              <label className="block text-xs text-gray-500 mb-1">Name <span className="text-gray-600">(optional)</span></label>
              <input
                type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50"
              />
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              <button type="submit" disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal text-white text-xs font-medium hover:bg-teal/80 transition-colors disabled:opacity-50">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                Add
              </button>
              <button type="button" onClick={() => { setShowAdd(false); setErr(null); }}
                className="p-2 text-gray-500 hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {err && <p className="w-full text-xs text-red-400">{err}</p>}
          </form>
        )}

        {/* Table */}
        {subscribers.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            No subscribers yet. Add one manually or share the subscribe link.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {subscribers.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {s.name ?? <span className="text-gray-500 font-normal italic">No name</span>}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{s.email}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                  s.status === "active"
                    ? "border-teal/30 bg-teal/10 text-teal"
                    : "border-gray-600/30 bg-gray-600/10 text-gray-500"
                }`}>
                  {s.status}
                </span>
                <span className="shrink-0 text-xs text-gray-600">
                  {SOURCE_LABELS[s.source] ?? s.source}
                </span>
                <span className="shrink-0 text-xs text-gray-600 hidden sm:block">
                  {new Date(s.subscribed_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {s.status === "active" && (
                    <button onClick={() => handleUnsubscribe(s.id, s.email)} disabled={isPending}
                      title="Mark unsubscribed"
                      className="p-1.5 text-gray-500 hover:text-amber-400 transition-colors disabled:opacity-50">
                      <UserX className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(s.id, s.email)} disabled={isPending}
                    title="Delete"
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
