"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { sendInvoiceAction } from "@/app/(dashboard)/invoices/actions";

export default function SendInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handle() {
    if (!confirm("Send this invoice to the client by email?")) return;
    setLoading(true);
    toast.loading("Sending invoice...");
    try {
      const result = await sendInvoiceAction(invoiceId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Invoice sent!");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal border border-teal/40 hover:border-teal rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      Send Invoice
    </button>
  );
}
