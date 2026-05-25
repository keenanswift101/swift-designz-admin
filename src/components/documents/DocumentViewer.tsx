"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

interface Props {
  slug: string;
  label: string;
  hasPdf?: boolean;
  /** When set, loads this URL with ?embed=true (returns HTML with data-URI PDF — no download prompt) */
  pdfPreviewUrl?: string;
  /** When set, shows an Edit button linking to this URL (admin only) */
  editUrl?: string;
}

export default function DocumentViewer({ slug, label, hasPdf = true, pdfPreviewUrl, editUrl }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  async function handleDownload() {
    setDownloading(true);
    toast.loading("Preparing download...");
    try {
      const res = await fetch(`/api/docs/templates/${slug}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? `${slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  // For PDF-only docs: load the embed endpoint (returns HTML with data-URI PDF).
  // For HTML template docs: load the static HTML file directly.
  const iframeSrc = pdfPreviewUrl
    ? `${pdfPreviewUrl}?embed=true`
    : `/docs/${slug}.html`;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/documents")}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{label}</h1>
        </div>
        <div className="flex items-center gap-2">
        {editUrl && (
          <Link
            href={editUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 border border-border hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
        {hasPdf && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal/10 text-teal border border-teal/25 hover:bg-teal/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </button>
        )}
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 relative bg-[#dde8e8]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
            <Loader2 className="h-6 w-6 animate-spin text-teal" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          title={label}
        />
      </div>
    </div>
  );
}
