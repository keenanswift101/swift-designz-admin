"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Ban } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { sendQuotationAction, cancelQuotationAction } from "@/app/(dashboard)/accounts-receivable/quotations/actions";

interface Props {
  id: string;
  action: "send" | "cancel";
}

export default function QuotationActions({ id, action }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handle() {
    if (action === "cancel") {
      const ok = await confirm("Cancel this quotation? This cannot be undone.", {
        title: "Cancel Quotation",
        confirmLabel: "Cancel Quotation",
        cancelLabel: "Keep",
        variant: "danger",
      });
      if (!ok) return;
    }
    if (action === "send") {
      const ok = await confirm("Mark this quotation as sent and lock it for editing? The client will receive an email with the acceptance link.", {
        title: "Send Quotation",
        confirmLabel: "Send",
        variant: "send",
      });
      if (!ok) return;
    }

    setLoading(true);
    toast.loading(action === "send" ? "Sending quotation..." : "Cancelling quotation...");
    try {
      const result = action === "send"
        ? await sendQuotationAction(id)
        : await cancelQuotationAction(id);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(action === "send" ? "Quotation sent!" : "Quotation cancelled.");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (action === "send") {
    return (
      <>
        {ConfirmDialog}
        <button
          onClick={handle}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal/10 text-teal border border-teal/25 hover:bg-teal/20 transition-colors text-xs font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send Quotation
        </button>
      </>
    );
  }

  return (
    <>
      {ConfirmDialog}
      <button
        onClick={handle}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-medium disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
        Cancel
      </button>
    </>
  );
}
