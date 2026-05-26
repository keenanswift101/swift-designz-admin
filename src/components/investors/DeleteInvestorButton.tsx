"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteInvestorAction } from "@/app/(dashboard)/investors/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";

export default function DeleteInvestorButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleDelete() {
    const ok = await confirm("Delete this investor? This cannot be undone.", {
      title: "Delete Investor",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setLoading(true);
    toast.loading("Deleting investor...");
    await deleteInvestorAction(id);
    toast.success("Investor deleted.");
  }

  return (
    <>
      {ConfirmDialog}
      <button
        disabled={loading}
        onClick={handleDelete}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400 border border-red-500/30 hover:border-red-500 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        Delete
      </button>
    </>
  );
}
