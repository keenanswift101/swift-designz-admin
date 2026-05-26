"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";

interface DeleteEquipmentButtonProps {
  name: string;
  action: () => Promise<void>;
}

export default function DeleteEquipmentButton({ name, action }: DeleteEquipmentButtonProps) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await confirm(`Delete "${name}"? This cannot be undone.`, {
      title: "Delete Equipment",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setLoading(true);
    toast.loading("Deleting equipment...");
    await action();
    toast.success("Equipment deleted.");
  }

  return (
    <>
      {ConfirmDialog}
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          Delete Equipment
        </button>
      </form>
    </>
  );
}
