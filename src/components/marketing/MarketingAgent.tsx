"use client";

import { useState, useTransition } from "react";
import { Sparkles, Copy, CheckCheck, Save, Loader2 } from "lucide-react";
import { generateMarketingCopyAction, saveDraftPostAction } from "@/app/(dashboard)/marketing/agent/actions";
import type { ContentPlatform } from "@/types/marketing";
import { PLATFORM_LABELS } from "@/types/marketing";

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

function MarkdownOutput({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed overflow-y-auto">
      {lines.map((line, i) => {
        if (line.startsWith("### "))
          return <h3 key={i} className="text-sm font-semibold text-foreground mt-4 mb-0.5">{renderInline(line.slice(4))}</h3>;
        if (line.startsWith("## "))
          return <h2 key={i} className="text-base font-bold text-foreground mt-5 mb-1">{renderInline(line.slice(3))}</h2>;
        if (line.startsWith("# "))
          return <h1 key={i} className="text-lg font-bold text-teal mt-2 mb-2">{renderInline(line.slice(2))}</h1>;
        if (/^-{3,}$/.test(line.trim()))
          return <hr key={i} className="border-border my-3" />;
        if (line.startsWith("- ") || line.startsWith("* "))
          return (
            <div key={i} className="flex gap-2 text-gray-300">
              <span className="text-teal shrink-0 mt-0.5">·</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        if (line.trim() === "")
          return <div key={i} className="h-1" />;
        return <p key={i} className="text-gray-300">{renderInline(line)}</p>;
      })}
    </div>
  );
}

const TASKS = [
  { id: "caption",  label: "Caption",        description: "Platform-ready post caption + hashtags" },
  { id: "campaign", label: "Campaign Idea",  description: "Full campaign concept with post ideas" },
  { id: "email",    label: "Email Copy",     description: "Subject, preview text, and email body" },
  { id: "hashtags", label: "Hashtag Set",    description: "20 targeted hashtags grouped by category" },
  { id: "headline", label: "Ad Headlines",   description: "5 headline variations under 30 characters" },
  { id: "cta",      label: "CTA Copy",       description: "5 call-to-action variations" },
];

export default function MarketingAgent() {
  const [task, setTask]         = useState("caption");
  const [platform, setPlatform] = useState<ContentPlatform>("instagram");
  const [brief, setBrief]       = useState("");
  const [result, setResult]     = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSaved(false);
    setCopied(false);

    const fd = new FormData();
    fd.set("task", task);
    fd.set("platform", platform);
    fd.set("brief", brief);

    startTransition(async () => {
      const res = await generateMarketingCopyAction(fd);
      if ("error" in res) { setError(res.error); return; }
      setResult(res.content);
    });
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveDraft() {
    if (!result) return;
    const title = TASKS.find((t) => t.id === task)?.label ?? "AI Draft";
    const fd = new FormData();
    fd.set("title", `${title} — ${brief.slice(0, 50)}`);
    fd.set("content", result);
    fd.set("platform", platform);
    startTransition(async () => {
      const res = await saveDraftPostAction(fd);
      if ("error" in res) { setError(res.error); return; }
      setSaved(true);
    });
  }

  const selectedTask = TASKS.find((t) => t.id === task);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input */}
      <div className="space-y-5">
        {/* Task selector */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">What do you need?</p>
          <div className="grid grid-cols-2 gap-2">
            {TASKS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTask(t.id)}
                className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  task === t.id
                    ? "border-teal/40 bg-teal/10 text-teal"
                    : "border-border text-gray-400 hover:text-foreground hover:border-border/80"
                }`}
              >
                <p className="text-xs font-medium">{t.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Platform + Brief */}
        <form onSubmit={handleGenerate} className="glass-card p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50"
            >
              {(Object.entries(PLATFORM_LABELS) as [ContentPlatform, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Brief <span className="text-gray-600">— what is this post about?</span>
            </label>
            <textarea
              rows={5}
              required
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={
                task === "campaign"
                  ? "e.g. Winter promo — 20% off all website packages. Target: Namibian SMEs."
                  : task === "email"
                  ? "e.g. Monthly newsletter announcing new portfolio projects and a referral incentive."
                  : "e.g. New e-commerce store launch for a Windhoek boutique. Showcase the clean design."
              }
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isPending ? "Generating…" : `Generate ${selectedTask?.label ?? "Copy"}`}
          </button>
        </form>

        {/* Context hint */}
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Context loaded</p>
          <div className="flex flex-wrap gap-1.5">
            {["10 portfolio projects", "6 services", "6 testimonials", "Brand voice", "Namibia / SA markets"].map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-teal/10 text-teal/80 border border-teal/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Output */}
      <div className="glass-card p-5 flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Generated Copy</p>
          {result && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border text-gray-400 hover:text-foreground transition-colors"
              >
                {copied ? <CheckCheck className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isPending || saved}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-teal/30 text-teal hover:bg-teal/10 transition-colors disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saved ? "Saved to drafts" : "Save as draft"}
              </button>
            </div>
          )}
        </div>

        {result ? (
          <div className="flex-1 overflow-y-auto">
            <MarkdownOutput content={result} />
          </div>
        ) : isPending ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-teal mx-auto" />
              <p className="text-sm text-gray-500">Writing your copy…</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Sparkles className="h-10 w-10 text-teal/30 mx-auto" />
              <p className="text-sm text-gray-500">Fill in the brief and hit Generate.</p>
              <p className="text-xs text-gray-600">
                The agent knows your services, portfolio, and brand voice.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
