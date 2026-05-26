"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { addPaymentAction } from "@/app/(dashboard)/invoices/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";

const METHODS = [
  { value: "eft", label: "EFT / Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

interface PaymentFormProps {
  invoiceId: string;
  outstandingCents: number;
}

export default function PaymentForm({ invoiceId, outstandingCents }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    toast.loading("Recording payment...");

    const result = await addPaymentAction(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      setSuccess(true);
      toast.success("Payment recorded!");
      formRef.current?.reset();
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  const inputCls = "w-full px-3 py-2 bg-[#111] border border-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal";
  const labelCls = "block text-xs text-gray-400 mb-1";

  const today = new Date().toISOString().split("T")[0];

  return (
    <form ref={formRef} onSubmit={(e) => { e.preventDefault(); void handleSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
      <input type="hidden" name="invoice_id" value={invoiceId} />

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-400">
          Payment recorded successfully.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Amount (R) *</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={outstandingCents > 0 ? (outstandingCents / 100).toFixed(2) : ""}
            placeholder="0.00"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Method *</label>
          <select name="method" required className={inputCls}>
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Date Paid *</label>
          <input
            name="paid_at"
            type="date"
            required
            defaultValue={today}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Reference <span className="text-gray-600">(optional)</span></label>
          <input
            name="reference"
            type="text"
            placeholder="BNK-REF-123"
            className={inputCls}
          />
        </div>
      </div>

      {/* Proof upload */}
      <div>
        <label className={labelCls}>
          <span className="flex items-center gap-1">
            <Upload className="h-3 w-3" />
            Proof of Payment <span className="text-gray-600">(optional)</span>
          </span>
        </label>
        <input
          name="proof"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="w-full text-xs text-gray-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-border file:bg-card file:text-sm file:text-foreground/60 file:cursor-pointer hover:file:border-teal transition-colors"
        />
      </div>

      <div>
        <label className={labelCls}>Notes <span className="text-gray-600">(optional)</span></label>
        <input name="notes" type="text" placeholder="e.g. Deposit payment" className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Recording…</> : "Record Payment"}
      </button>
    </form>
  );
}
