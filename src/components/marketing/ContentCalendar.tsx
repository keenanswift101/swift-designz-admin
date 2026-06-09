"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, X, Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { createContentPostAction, updateContentPostAction, deleteContentPostAction } from "@/app/(dashboard)/marketing/campaigns/actions";
import { useConfirm } from "@/hooks/useConfirm";
import type { ContentPost, MarketingCampaign, ContentPlatform, ContentStatus } from "@/types/marketing";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/types/marketing";

interface Props {
  posts: ContentPost[];
  campaigns: Pick<MarketingCampaign, "id" | "name">[];
  year: number;
  month: number;
}

const MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month - 1, 1);
  const last  = new Date(year, month, 0);
  // Week starts Monday (0 = Mon ... 6 = Sun)
  const startPad = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month - 1, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const EMPTY_FORM = { title:"", content:"", platform:"instagram" as ContentPlatform, scheduled_at:"", campaign_id:"", notes:"", status:"draft" as ContentStatus };

export default function ContentCalendar({ posts, campaigns, year, month }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<{ day: string; post?: ContentPost } | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { confirm, ConfirmDialog } = useConfirm();

  const days = buildCalendarDays(year, month);
  const today = dateKey(new Date());

  // Group posts by date
  const postsByDay = posts.reduce<Record<string, ContentPost[]>>((acc, p) => {
    if (!p.scheduled_at) return acc;
    const key = p.scheduled_at.slice(0, 10);
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  function prevMonth() {
    const d = new Date(year, month - 2, 1);
    router.push(`/marketing/calendar?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  }
  function nextMonth() {
    const d = new Date(year, month, 1);
    router.push(`/marketing/calendar?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  }

  function openNew(day: string) {
    setForm({ ...EMPTY_FORM, scheduled_at: `${day}T09:00` });
    setError(null);
    setModal({ day });
  }

  function openEdit(post: ContentPost) {
    setForm({
      title:        post.title,
      content:      post.content ?? "",
      platform:     post.platform as ContentPlatform,
      scheduled_at: post.scheduled_at ? post.scheduled_at.slice(0, 16) : "",
      campaign_id:  post.campaign_id ?? "",
      notes:        post.notes ?? "",
      status:       post.status as ContentStatus,
    });
    setError(null);
    setModal({ day: post.scheduled_at?.slice(0, 10) ?? "", post });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    setError(null);
    startTransition(async () => {
      const res = modal?.post
        ? await updateContentPostAction(modal.post.id, fd)
        : await createContentPostAction(fd);
      if ("error" in res) { setError(res.error ?? "Unknown error"); return; }
      setModal(null);
    });
  }

  async function handleDelete() {
    if (!modal?.post) return;
    const ok = await confirm(`Delete "${modal.post.title}"?`, { variant: "danger" });
    if (!ok) return;
    startTransition(async () => {
      await deleteContentPostAction(modal.post!.id);
      setModal(null);
    });
  }

  return (
    <div className="space-y-4">
      {ConfirmDialog}
      <PageHeader title="Content Calendar" description="Plan and schedule posts across all platforms" />

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-foreground">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="glass-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_NAMES.map((d) => (
            <div key={d} className="px-2 py-2 text-xs text-gray-500 font-medium text-center">{d}</div>
          ))}
        </div>
        {/* Weeks */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="min-h-[90px] bg-white/[0.01]" />;
            const key = dateKey(day);
            const dayPosts = postsByDay[key] ?? [];
            const isToday = key === today;
            return (
              <div key={key} className="min-h-[90px] p-1.5 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday ? "bg-teal text-white" : "text-gray-400"
                  }`}>
                    {day.getDate()}
                  </span>
                  <button
                    onClick={() => openNew(key)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-500 hover:text-teal"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => openEdit(p)}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate border ${PLATFORM_COLORS[p.platform as ContentPlatform] ?? PLATFORM_COLORS.other}`}
                    >
                      {p.title}
                    </button>
                  ))}
                  {dayPosts.length > 3 && (
                    <span className="text-xs text-gray-500 px-1">+{dayPosts.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform legend */}
      <div className="flex flex-wrap gap-2 px-1">
        {(Object.entries(PLATFORM_LABELS) as [ContentPlatform, string][]).map(([p, l]) => (
          <span key={p} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${PLATFORM_COLORS[p]}`}>
            {l}
          </span>
        ))}
      </div>

      {/* Post modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {modal.post ? "Edit Post" : `New Post — ${modal.day}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Post title or headline"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Platform</label>
                  <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as ContentPlatform }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    {(Object.entries(PLATFORM_LABELS) as [ContentPlatform, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Scheduled At</label>
                  <input type="datetime-local" value={form.scheduled_at}
                    onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50" />
                </div>
              </div>

              {modal.post && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ContentStatus }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    {(["draft","scheduled","published","cancelled"] as ContentStatus[]).map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">Copy / Caption</label>
                <textarea rows={3} value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Post copy or caption..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50 resize-none" />
              </div>

              {campaigns.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Campaign (optional)</label>
                  <select value={form.campaign_id} onChange={(e) => setForm((f) => ({ ...f, campaign_id: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50">
                    <option value="">— None —</option>
                    {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2 justify-between pt-1">
                <div>
                  {modal.post && (
                    <button type="button" onClick={handleDelete} disabled={isPending}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setModal(null)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-50">
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {modal.post ? "Save" : "Add Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
