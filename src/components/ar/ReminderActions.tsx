"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Send, X, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { approveReminderAction, sendReminderAction, dismissReminderAction } from "@/app/(dashboard)/accounts-receivable/reminders/actions";

interface Props {
  id: string;
  status: string;
  whatsappMessage: string | null;
  stage: number;
}

export default function ReminderActions({ id, status, whatsappMessage, stage }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handle(action: "approve" | "send" | "dismiss") {
    setLoading(action);
    toast.loading(action === "approve" ? "Approving..." : action === "send" ? "Sending reminder..." : "Dismissing...");
    try {
      const result = action === "approve"
        ? await approveReminderAction(id)
        : action === "send"
        ? await sendReminderAction(id)
        : await dismissReminderAction(id);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(action === "send" ? "Reminder sent!" : action === "approve" ? "Approved." : "Dismissed.");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function copyWhatsApp() {
    if (!whatsappMessage) return;
    await navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "sent" || status === "dismissed") return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {stage >= 3 && whatsappMessage && (
        <button
          onClick={copyWhatsApp}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          WhatsApp
        </button>
      )}
      {status === "pending" && (
        <button
          onClick={() => handle("approve")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-teal/10 text-teal border border-teal/20 hover:bg-teal/20 transition-colors disabled:opacity-50"
        >
          {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
          Approve
        </button>
      )}
      <button
        onClick={() => handle("send")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-teal/10 text-teal border border-teal/20 hover:bg-teal/20 transition-colors disabled:opacity-50"
      >
        {loading === "send" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        Send Now
      </button>
      <button
        onClick={() => handle("dismiss")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-colors disabled:opacity-50"
      >
        {loading === "dismiss" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
        Dismiss
      </button>
    </div>
  );
}
