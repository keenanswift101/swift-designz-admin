"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { updateRetainerStatusAction, deleteRetainerSubscriptionAction } from "@/app/(dashboard)/accounts-receivable/retainers/actions";

interface Props {
  id: string;
  status: "active" | "paused" | "cancelled";
}

export default function RetainerStatusButton({ id, status }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function changeStatus(newStatus: "active" | "paused" | "cancelled") {
    setLoading(true);
    toast.loading("Updating...");
    try {
      const result = await updateRetainerStatusAction(id, newStatus);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`Retainer ${newStatus}.`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this retainer subscription? This cannot be undone.")) return;
    setLoading(true);
    toast.loading("Deleting...");
    try {
      const result = await deleteRetainerSubscriptionAction(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Retainer deleted.");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />;
  }

  return (
    <div className="flex items-center gap-2">
      {status === "active" && (
        <button
          onClick={() => changeStatus("paused")}
          className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
        >
          Pause
        </button>
      )}
      {status === "paused" && (
        <button
          onClick={() => changeStatus("active")}
          className="text-xs text-gray-500 hover:text-teal transition-colors"
        >
          Resume
        </button>
      )}
      {status !== "cancelled" && (
        <button
          onClick={() => changeStatus("cancelled")}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Cancel
        </button>
      )}
      {status === "cancelled" && (
        <button
          onClick={handleDelete}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  );
}
