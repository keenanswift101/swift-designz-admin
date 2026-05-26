"use client";

import { useState } from "react";
import { deleteLead } from "@/app/(dashboard)/leads/actions";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";

interface Props {
  leadId: string;
}

export default function DeleteLeadButton({ leadId }: Props) {
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleDelete() {
    const ok = await confirm("Delete this lead? This action cannot be undone.", {
      title: "Delete Lead",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setPending(true);
    toast.loading("Deleting lead...");
    await deleteLead(leadId);
    toast.success("Lead deleted.");
  }

  return (
    <>
      {ConfirmDialog}
      <button
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent hover:bg-red-500/10 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {pending ? "Deleting..." : "Delete"}
      </button>
    </>
  );
}
