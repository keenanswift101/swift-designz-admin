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
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
        title="Delete invoice"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      </button>
    </>
  );
}
