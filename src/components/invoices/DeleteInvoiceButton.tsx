"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteInvoiceAction } from "@/app/(dashboard)/invoices/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";

export default function DeleteInvoiceButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleDelete() {
    const ok = await confirm("Delete this invoice? All associated payments will also be removed.", {
      title: "Delete Invoice",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setLoading(true);
    toast.loading("Deleting invoice...");
    await deleteInvoiceAction(id);
    toast.success("Invoice deleted.");
  }

  return (
    <>
      {ConfirmDialog}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400 border border-red-500/30 hover:border-red-500 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        Delete
      </button>
    </>
  );
}
