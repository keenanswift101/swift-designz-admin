"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { sendRetainerReceiptAction } from "@/app/(dashboard)/accounts-receivable/retainers/actions";

export default function SendRetainerReceiptButton({
  paymentId,
  clientEmail,
  receiptNumber,
}: {
  paymentId: string;
  clientEmail: string;
  receiptNumber: string;
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handle() {
    const ok = await confirm(
      `Send receipt ${receiptNumber} to ${clientEmail}?`,
      { title: "Send Retainer Receipt", confirmLabel: "Send Receipt", variant: "send" }
    );
    if (!ok) return;
    setLoading(true);
    toast.loading("Sending receipt...");
    try {
      const result = await sendRetainerReceiptAction(paymentId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Receipt sent!");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {ConfirmDialog}
      <button
        onClick={handle}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal border border-teal/40 hover:border-teal rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Send Receipt
      </button>
    </>
  );
}
