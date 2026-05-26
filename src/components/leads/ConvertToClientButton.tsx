"use client";

import { useState } from "react";
import { convertLeadToClient } from "@/app/(dashboard)/leads/actions";
import { UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";

interface Props {
  leadId: string;
}

export default function ConvertToClientButton({ leadId }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleConvert() {
    const ok = await confirm("Convert this lead to a client? A new client profile will be created and the lead will be marked as won.", {
      title: "Convert to Client",
      confirmLabel: "Convert",
      variant: "convert",
    });
    if (!ok) return;
    setPending(true);
    setError(null);
    toast.loading("Converting to client...");
    const result = await convertLeadToClient(leadId);
    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
      setPending(false);
    } else {
      toast.success("Client created!");
    }
  }

  return (
    <>
      {ConfirmDialog}
      <div>
        <button
          onClick={handleConvert}
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal hover:bg-teal-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {pending ? "Converting..." : "Convert to Client"}
        </button>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    </>
  );
}
