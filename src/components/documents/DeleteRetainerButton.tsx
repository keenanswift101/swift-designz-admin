"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteRetainerAction } from "@/app/(dashboard)/documents/retainers/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";

export default function DeleteRetainerButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleDelete() {
    const ok = await confirm(`Delete "${name}"? This cannot be undone.`, {
      title: "Delete Retainer",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    toast.loading("Deleting retainer...");
    startTransition(async () => {
      try {
        await deleteRetainerAction(id);
        toast.success("Retainer deleted.");
      } catch {
        toast.error("Failed to delete retainer.");
      }
    });
  }

  return (
    <>
      {ConfirmDialog}
      <button type="button" onClick={handleDelete} disabled={isPending}
        className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        title="Delete">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </>
  );
}
