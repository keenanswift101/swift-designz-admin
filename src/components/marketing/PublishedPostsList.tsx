"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2, X, Search, Download, LayoutGrid, List, Play } from "lucide-react";
import {
  updateContentPostAction,
  deleteContentPostAction,
} from "@/app/(dashboard)/marketing/campaigns/actions";
import { importMarketingAssetsAction } from "@/app/(dashboard)/marketing/posts/actions";
import { useConfirm } from "@/hooks/useConfirm";
import type { ContentPost, MarketingCampaign, ContentPlatform, ContentStatus } from "@/types/marketing";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/types/marketing";

interface Props {
  posts: ContentPost[];
  drafts: ContentPost[];
  campaigns: Pick<MarketingCampaign, "id" | "name">[];
}

function assetUrl(notes: string | null): string | null {
  if (!notes) return null;
  // Normalise absolute URL → relative so the Next.js proxy rewrite handles it
  if (notes.includes("swiftdesignz.co.za/marketing/")) {
    return notes.replace(/^https?:\/\/[^/]+/, "");
  }
  if (notes.startsWith("/marketing/")) return notes;
  return null;
}

function isVideo(url: string) {
  return url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov");
}

function MediaThumb({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (isVideo(url)) {
    return (
      <div className="relative w-full h-full bg-black/40 pointer-events-none">
        <video
          src={url}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
          playsInline
          loop
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="h-3.5 w-3.5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={title}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

export default function PublishedPostsList({ posts, drafts, campaigns }: Props) {
  const [tab, setTab]           = useState<"published" | "drafts">("published");
  const [filter, setFilter]     = useState<ContentPlatform | "all">("all");
  const [search, setSearch]     = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [editing, setEditing]   = useState<ContentPost | null>(null);
  const [form, setForm]         = useState<{
    title: string; content: string; platform: ContentPlatform;
    scheduled_at: string; campaign_id: string; notes: string; status: ContentStatus;
  } | null>(null);
  const [error, setError]       = useState<string | null>(null);
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

  function handleImport() {
    setImportMsg(null);
    startTransition(async () => {
      const res = await importMarketingAssetsAction();
      if (res.error) { setImportMsg(`Error: ${res.error}`); return; }
      setImportMsg(
        res.imported > 0
          ? `Imported ${res.imported} posts${res.skipped > 0 ? ` (${res.skipped} already existed)` : ""}.`
          : `All ${res.skipped} assets already imported.`
      );
    });
  }

  const activeList = tab === "drafts" ? drafts : posts;
  const platforms  = [...new Set(posts.map((p) => p.platform))] as ContentPlatform[];

  const visible = activeList.filter((p) => {
    if (tab === "published" && filter !== "all" && p.platform !== filter) return false;
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

      {importMsg && (
        <div className="glass-card px-4 py-3 text-sm border border-teal/20 text-teal flex items-center justify-between">
          {importMsg}
          <button onClick={() => setImportMsg(null)} className="text-gray-500 hover:text-foreground ml-4">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["published", "drafts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(""); setFilter("all"); }}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-teal text-teal"
                  : "border-transparent text-gray-500 hover:text-foreground"
              }`}
            >
              {t === "published" ? "Published" : "Drafts"}
              <span className="ml-2 text-xs tabular-nums px-1.5 py-0.5 rounded-full bg-border text-gray-400">
                {t === "published" ? posts.length : drafts.length}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-gray-500 focus:outline-none focus:border-teal/50"
            />
          </div>

          {tab === "published" && (
            <div className="flex items-center gap-1.5 flex-wrap">
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
          )}

          <span className="text-xs text-gray-500 shrink-0">{visible.length}</span>

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1.5 transition-colors ${viewMode === "grid" ? "bg-teal/10 text-teal" : "text-gray-500 hover:text-foreground"}`}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1.5 transition-colors ${viewMode === "list" ? "bg-teal/10 text-teal" : "text-gray-500 hover:text-foreground"}`}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          {tab === "published" && (
            <button
              onClick={handleImport}
              disabled={isPending}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-gray-400 hover:text-foreground hover:border-teal/30 transition-colors disabled:opacity-50"
              title="Import marketing assets from website"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Import assets
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            {tab === "drafts"
              ? "No drafts yet. Generate content in Marketing Agent and hit Save as draft."
              : posts.length === 0
              ? <span>No posts yet. Click <strong>Import assets</strong> to pull in all 47 website marketing assets.</span>
              : "No posts match the filter."}
          </div>
        ) : viewMode === "grid" ? (
          /* ── Grid view ── */
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {visible.map((p) => {
              const url = assetUrl(p.notes);
              return (
                <button
                  key={p.id}
                  onClick={() => openEdit(p)}
                  onMouseEnter={(e) => {
                    (e.currentTarget.querySelector("video") as HTMLVideoElement | null)?.play();
                  }}
                  onMouseLeave={(e) => {
                    const v = e.currentTarget.querySelector("video") as HTMLVideoElement | null;
                    if (v) { v.pause(); v.currentTime = 0; }
                  }}
                  className="group relative rounded-lg overflow-hidden border border-border hover:border-teal/40 transition-colors bg-black/20 aspect-square"
                >
                  {url ? (
                    <MediaThumb url={url} title={p.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 p-2 text-center">
                      {p.title}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
                    <span className={`self-start text-[10px] px-1.5 py-0.5 rounded-full border mb-1 ${PLATFORM_COLORS[p.platform as ContentPlatform] ?? PLATFORM_COLORS.other}`}>
                      {PLATFORM_LABELS[p.platform as ContentPlatform] ?? p.platform}
                    </span>
                    <p className="text-xs text-white font-medium line-clamp-2 text-left">{p.title}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Pencil className="h-3 w-3 text-teal" />
                      <span className="text-[10px] text-teal">Edit</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* ── List view ── */
          <div className="divide-y divide-border">
            {visible.map((p) => {
              const url = assetUrl(p.notes);
              const campaign = campaignName(p.campaign_id);
              const date = p.scheduled_at ?? p.created_at;
              return (
                <div key={p.id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/2 transition-colors">
                  {/* Thumbnail */}
                  <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-border bg-black/20">
                    {url ? (
                      <MediaThumb url={url} title={p.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">No media</div>
                    )}
                  </div>

                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[p.platform as ContentPlatform] ?? PLATFORM_COLORS.other}`}>
                    {PLATFORM_LABELS[p.platform as ContentPlatform] ?? p.platform}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    {p.content && <p className="text-xs text-gray-500 mt-0.5 truncate">{p.content}</p>}
                    {campaign && <span className="text-xs text-teal/70">{campaign}</span>}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-500">
                      {date ? new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </p>
                  </div>

                  <button onClick={() => openEdit(p)} className="shrink-0 text-gray-500 hover:text-teal transition-colors">
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
          <div className="glass-card w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              {/* Media preview in modal */}
              {assetUrl(editing.notes) && (
                <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-border bg-black/20">
                  <MediaThumb url={assetUrl(editing.notes)!} title={editing.title} />
                </div>
              )}
              <div className="flex-1 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Edit Post</h2>
                <button onClick={() => { setEditing(null); setForm(null); }} className="text-gray-500 hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {assetUrl(editing.notes) && (
              <a
                href={assetUrl(editing.notes)!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal/70 hover:text-teal truncate block"
              >
                {assetUrl(editing.notes)}
              </a>
            )}

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
                <label className="block text-xs text-gray-400 mb-1">Copy / Caption</label>
                <textarea rows={3} value={form.content}
                  onChange={(e) => setForm((f) => f && ({ ...f, content: e.target.value }))}
                  placeholder="Write a caption for this post..."
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
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
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
