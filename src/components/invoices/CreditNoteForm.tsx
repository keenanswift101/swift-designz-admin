"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { createCreditNoteAction } from "@/app/(dashboard)/invoices/actions";

export default function CreditNoteForm({ invoiceId }: { invoiceId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const toast = useToast();

  async function handle(formData: FormData) {
    setLoading(true);
    toast.loading("Creating credit note...");
    try {
      const result = await createCreditNoteAction(formData);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Credit note created.");
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal border border-teal/30 hover:border-teal rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Credit Note
        </button>
      ) : (
        <form ref={formRef} action={handle} className="space-y-3 pt-2">
          <input type="hidden" name="invoice_id" value={invoiceId} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                name="type"
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal"
              >
                <option value="adjustment">Adjustment</option>
                <option value="refund">Refund</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount (R)</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:border-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Reason</label>
            <textarea
              name="reason"
              required
              rows={2}
              placeholder="Reason for credit note..."
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:border-teal resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal text-background rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Create
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
