"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ban } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { voidCreditNoteAction } from "@/app/(dashboard)/invoices/actions";

export default function VoidCreditNoteButton({ id, invoiceId }: { id: string; invoiceId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handle() {
    const ok = await confirm("Void this credit note? This cannot be undone.", {
      title: "Void Credit Note",
      confirmLabel: "Void",
      variant: "danger",
    });
    if (!ok) return;
    setLoading(true);
    toast.loading("Voiding...");
    try {
      const result = await voidCreditNoteAction(id, invoiceId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Credit note voided.");
        router.refresh();
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
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
        title="Void credit note"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
      </button>
    </>
  );
}
