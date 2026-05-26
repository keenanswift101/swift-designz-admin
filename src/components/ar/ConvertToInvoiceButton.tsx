"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { convertToInvoiceAction } from "@/app/(dashboard)/accounts-receivable/quotations/actions";

export default function ConvertToInvoiceButton({ quotationId }: { quotationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handle() {
    const ok = await confirm("Convert this quotation to an invoice? This will lock the quotation and create a new invoice.", {
      title: "Convert to Invoice",
      confirmLabel: "Convert",
      variant: "convert",
    });
    if (!ok) return;
    setLoading(true);
    toast.loading("Converting to invoice...");
    try {
      const result = await convertToInvoiceAction(quotationId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Invoice created!");
        router.push(`/invoices/${result.invoiceId}`);
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
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal/10 text-teal border border-teal/25 hover:bg-teal/20 transition-colors text-xs font-medium disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
        Convert to Invoice
      </button>
    </>
  );
}
