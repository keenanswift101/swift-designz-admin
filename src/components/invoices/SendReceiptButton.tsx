"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { sendReceiptAction } from "@/app/(dashboard)/invoices/actions";
import { createPortal } from "react-dom";

export interface ReceiptPreviewData {
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  invoiceNumber: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentReference?: string | null;
  paymentDate: string;
  invoiceTotal: number;
  invoicePaidTotal: number;
}

function fmt(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });
}

interface Props {
  paymentId: string;
  previewData?: ReceiptPreviewData;
}

export default function SendReceiptButton({ paymentId, previewData }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleSend() {
    setLoading(true);
    toast.loading("Sending receipt...");
    try {
      const result = await sendReceiptAction(paymentId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Receipt sent!");
        setShowModal(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleClick() {
    if (previewData) {
      setShowModal(true);
    } else {
      const ok = await confirm("Send a payment receipt to the client by email?", {
        title: "Send Receipt",
        confirmLabel: "Send Receipt",
        variant: "send",
      });
      if (!ok) return;
      handleSend();
    }
  }

  const balance = previewData
    ? previewData.invoiceTotal - previewData.invoicePaidTotal
    : 0;

  return (
    <>
      {ConfirmDialog}
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-medium text-teal border border-teal/40 hover:border-teal rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap w-full"
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        Send Receipt
      </button>

      {showModal && previewData && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !loading && setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal" />
                <h3 className="text-sm font-semibold text-foreground">Receipt Preview</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="p-1.5 rounded-lg text-gray-500 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preview content */}
            <div className="px-6 py-5 space-y-4">
              {/* Amount paid hero */}
              <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-4 text-center">
                <p className="text-xs text-green-400/70 uppercase tracking-wider mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-green-400 tabular-nums">{fmt(previewData.paymentAmount)}</p>
              </div>

              {/* Details grid */}
              <div className="space-y-2.5">
                <Row label="Client" value={previewData.clientName} sub={previewData.clientCompany ?? undefined} />
                <Row label="Send to" value={previewData.clientEmail} />
                <Row label="Invoice" value={previewData.invoiceNumber} />
                <Row label="Method" value={previewData.paymentMethod.charAt(0).toUpperCase() + previewData.paymentMethod.slice(1)} />
                {previewData.paymentReference && (
                  <Row label="Reference" value={previewData.paymentReference} />
                )}
                <Row label="Date" value={fmtDate(previewData.paymentDate)} />
                <div className="border-t border-border pt-2.5 space-y-2">
                  <Row label="Invoice Total" value={fmt(previewData.invoiceTotal)} />
                  <Row label="Balance After" value={balance <= 0 ? "Paid in Full" : fmt(balance)} valueClass={balance <= 0 ? "text-teal font-semibold" : "text-amber-400 font-semibold"} />
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                A PDF receipt will be generated and emailed to <span className="text-gray-400">{previewData.clientEmail}</span>.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-teal text-background text-sm font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Receipt
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function Row({ label, value, sub, valueClass }: { label: string; value: string; sub?: string; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-xs text-right ${valueClass ?? "text-foreground"}`}>
        {value}
        {sub && <span className="block text-gray-500">{sub}</span>}
      </span>
    </div>
  );
}
