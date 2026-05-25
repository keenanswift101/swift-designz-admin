"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteEmployeeContractAction } from "@/app/(dashboard)/documents/employee-contracts/actions";
import { useToast } from "@/components/ui/ToastProvider";

export default function DeleteEmployeeContractButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteEmployeeContractAction(id);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      title="Delete"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
