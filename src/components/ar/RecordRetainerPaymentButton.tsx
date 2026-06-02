"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PlusCircle, Send, Loader2, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import {
  recordRetainerPaymentAction,
  sendRetainerReceiptAction,
} from "@/app/(dashboard)/accounts-receivable/retainers/actions";

interface Props {
  retainerId: string;
  retainerName: string;
  clientName: string;
  clientEmail: string | null;
  monthlyAmount: number;  // cents
  paymentCount: number;   // total payments recorded so far
}

export default function RecordRetainerPaymentButton({
  retainerId,
  retainerName,
  clientName,
  clientEmail,
  monthlyAmount,
  paymentCount,
}: Props) {
  // Next payment number in a 12-month cycle (restarts after 12)
  const nextPaymentNum = (paymentCount % 12) + 1;
  const buttonLabel = nextPaymentNum === 1 ? "Record Payment" : `Record Payment ${nextPaymentNum}`;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(false);
  const [recorded, setRecorded] = useState<{ paymentId: string; receiptNumber: string } | null>(null);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form state
  const today = new Date().toISOString().split("T")[0];
  const [amount, setAmount] = useState((monthlyAmount / 100).toFixed(2));
  const [method, setMethod] = useState("eft");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(today);

  function resetForm() {
    setAmount((monthlyAmount / 100).toFixed(2));
    setMethod("eft");
    setReference("");
    setDate(today);
    setRecorded(null);
  }

  async function handleRecord() {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      const result = await recordRetainerPaymentAction(retainerId, {
        amount: amountCents,
        paymentMethod: method,
        paymentDate: date,
        reference: reference.trim() || undefined,
      });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setRecorded(result);
        toast.success(`Payment recorded — ${result.receiptNumber}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReceipt() {
    if (!recorded) return;
    if (!clientEmail) {
      toast.error("Client has no email address.");
      return;
    }
    const ok = await confirm(
      `Send receipt ${recorded.receiptNumber} to ${clientEmail}?`,
      { title: "Send Receipt", confirmLabel: "Send Receipt", variant: "send" }
    );
    if (!ok) return;
    setSendingReceipt(true);
    toast.loading("Sending receipt...");
    try {
      const result = await sendRetainerReceiptAction(recorded.paymentId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Receipt sent!");
        setOpen(false);
        resetForm();
      }
    } finally {
      setSendingReceipt(false);
    }
  }

  return (
    <>
      {ConfirmDialog}

      <button
        onClick={() => { setOpen(true); resetForm(); }}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal border border-teal/30 hover:border-teal rounded-lg transition-colors"
      >
        <PlusCircle className="h-3 w-3" />
        {buttonLabel}
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-border rounded-xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <p className="text-xs text-teal font-semibold uppercase tracking-wider">
                  {nextPaymentNum === 1 ? "Record Payment" : `Record Payment ${nextPaymentNum}`}
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{retainerName}</p>
                <p className="text-xs text-gray-500">{clientName}</p>
              </div>
              <button onClick={() => { setOpen(false); resetForm(); }} className="text-gray-500 hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {recorded ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 bg-teal/10 border border-teal/20 rounded-lg px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-teal shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-teal">{recorded.receiptNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Payment recorded successfully.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {clientEmail ? (
                    <button
                      onClick={handleSendReceipt}
                      disabled={sendingReceipt}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {sendingReceipt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Receipt to {clientEmail}
                    </button>
                  ) : (
                    <p className="text-xs text-gray-500 flex-1">No email on file — receipt not sent.</p>
                  )}
                  <button
                    onClick={() => { setOpen(false); resetForm(); }}
                    className="px-4 py-2.5 text-sm text-gray-400 border border-border hover:border-gray-500 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Amount (N$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Method</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal transition-colors"
                    >
                      <option value="eft">EFT</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Reference</label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Bank ref (optional)"
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleRecord}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                    Record Payment
                  </button>
                  <button
                    onClick={() => { setOpen(false); resetForm(); }}
                    className="px-4 py-2.5 text-sm text-gray-400 border border-border hover:border-gray-500 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
