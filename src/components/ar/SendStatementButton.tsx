"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { sendStatementAction } from "@/app/(dashboard)/accounts-receivable/statements/actions";

export default function SendStatementButton({
  statementId,
  clientEmail,
}: {
  statementId: string;
  clientEmail: string;
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handle() {
    const ok = await confirm(
      `Send this account statement to ${clientEmail}? A PDF will be attached.`,
      { title: "Send Statement", confirmLabel: "Send Statement", variant: "send" }
    );
    if (!ok) return;
    setLoading(true);
    toast.loading("Sending statement...");
    try {
      const result = await sendStatementAction(statementId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Statement sent!");
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
        Send Statement
      </button>
    </>
  );
}
