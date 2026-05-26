"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { deleteStatementAction } from "@/app/(dashboard)/accounts-receivable/statements/actions";

export default function DeleteStatementButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handle() {
    const ok = await confirm("Delete this statement? This cannot be undone.", {
      title: "Delete Statement",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setLoading(true);
    toast.loading("Deleting...");
    try {
      const result = await deleteStatementAction(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Statement deleted.");
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
        title="Delete statement"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      </button>
    </>
  );
}
