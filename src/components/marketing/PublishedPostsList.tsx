"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2, X, Search } from "lucide-react";
import {
  updateContentPostAction,
  deleteContentPostAction,
} from "@/app/(dashboard)/marketing/campaigns/actions";
import { useConfirm } from "@/hooks/useConfirm";
import type { ContentPost, MarketingCampaign, ContentPlatform, ContentStatus } from "@/types/marketing";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/types/marketing";

interface Props {
  posts: ContentPost[];
  campaigns: Pick<MarketingCampaign, "id" | "name">[];
}

export default function PublishedPostsList({ posts, campaigns }: Props) {
  const [filter, setFilter] = useState<ContentPlatform | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ContentPost | null>(null);
  const [form, setForm] = useState<{
    title: string; content: string; platform: ContentPlatform;
    scheduled_at: string; campaign_id: string; notes: string; status: ContentStatus;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { confirm, ConfirmDialog } = useConfirm();

  function openEdit(p: ContentPost) {
    setEditing(p);
    setForm({
      title:        p.title,
      content:      p.content ?? "",
      platform:     p.platform as ContentPlatform,
      scheduled_at: p.scheduled_at ? p.scheduled_at.slice(0, 16) : "",
      campaign_id:  p.campaign_id ?? "",
      notes:        p.notes ?? "",
      status:       p.status as ContentStatus,
    });
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !form) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    setError(null);
    startTransition(async () => {
      const res = await updateContentPostAction(editing.id, fd);
      if ("error" in res) { setError(res.error ?? "Unknown error"); return; }
      setEditing(null);
      setForm(null);
    });
  }

  async function handleDelete() {
    if (!editing) return;
    const ok = await confirm(`Delete "${editing.title}"?`, { variant: "danger" });
    if (!ok) return;
    startTransition(async () => {
      await deleteContentPostAction(editing.id);
      setEditing(null);
      setForm(null);
    });
  }

  const platforms = [...new Set(posts.map((p) => p.platform))] as ContentPlatform[];

  const visible = posts.filter((p) => {
    if (filter !== "all" && p.platform !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function campaignName(id: string | null) {
    if (!id) return null;
    return campaigns.find((c) => c.id === id)?.name ?? null;
  }

  return (
    <>
      {ConfirmDialog}

      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-gray-500 focus:outline-none focus:border-teal/50"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filter === "all"
                  ? "border-teal/40 bg-teal/10 text-teal"
                  : "border-border text-gray-400 hover:text-foreground"
              }`}
            >
              All
            </button>
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  filter === p ? PLATFORM_COLORS[p] : "border-border text-gray-400 hover:text-foreground"
                }`}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 shrink-0">{visible.length} posts</span>
        </div>

        {visible.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            {posts.length === 0 ? "No published posts yet." : "No posts match the filter."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((p) => {
              const campaign = campaignName(p.campaign_id);
              const date = p.scheduled_at ?? p.created_at;
              return (
                <div
                  key={p.id}
                  className="px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={`shrink-0 mt-0.5 text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[p.platform as ContentPlatform] ?? PLATFORM_COLORS.other}`}>
                    {PLATFORM_LABELS[p.platform as ContentPlatform] ?? p.platform}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    {p.content && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.content}</p>
                    )}
                    {campaign && (
                      <span className="inline-block mt-1 text-xs text-teal/70">{campaign}</span>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-500">
                      {date ? new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </p>
                    {p.notes && (
                      <p className="text-xs text-gray-600 mt-0.5 max-w-[140px] truncate">{p.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => openEdit(p)}
                    className="shrink-0 text-gray-500 hover:text-teal transition-colors mt-0.5"
                    title="Edit post"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Edit Post</h2>
              <button onClick={() => { setEditing(null); setForm(null); }} className="text-gray-500 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input required value={form.title}
                  onChange={(e) => setForm((f) => f && ({ ...f, title: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Platform</label>
                  <select value={form.platform}
                    onChange={(e) => setForm((f) => f && ({ ...f, platform: e.target.value as ContentPlatform }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    {(Object.entries(PLATFORM_LABELS) as [ContentPlatform, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm((f) => f && ({ ...f, status: e.target.value as ContentStatus }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    {(["draft", "scheduled", "published", "cancelled"] as ContentStatus[]).map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Scheduled At</label>
                <input type="datetime-local" value={form.scheduled_at}
                  onChange={(e) => setForm((f) => f && ({ ...f, scheduled_at: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Copy / Caption</label>
                <textarea rows={3} value={form.content}
                  onChange={(e) => setForm((f) => f && ({ ...f, content: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50 resize-none" />
              </div>

              {campaigns.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Campaign (optional)</label>
                  <select value={form.campaign_id}
                    onChange={(e) => setForm((f) => f && ({ ...f, campaign_id: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    <option value="">— None —</option>
                    {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2 justify-between pt-1">
                <button type="button" onClick={handleDelete} disabled={isPending}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="h-3.5 w-3.5 inline mr-1" />Delete
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditing(null); setForm(null); }}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-50">
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
