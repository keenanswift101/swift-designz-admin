"use client";

import { useActionState } from "react";
import type { Liability } from "@/types/database";

const INPUT = "w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal";
const LABEL = "block text-xs text-gray-500 mb-1";

interface LiabilityFormProps {
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
  defaultValues?: Partial<Liability>;
}

export default function LiabilityForm({ action, defaultValues }: LiabilityFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => action(formData),
    undefined,
  );

  const dv = defaultValues ?? {};
  const toDecimal = (cents: number | undefined) =>
    cents != null ? (cents / 100).toFixed(2) : "";

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={LABEL}>Name *</label>
          <input id="name" name="name" type="text" required defaultValue={dv.name ?? ""}
            placeholder="e.g. FNB Business Loan" className={INPUT} />
        </div>

        <div>
          <label htmlFor="type" className={LABEL}>Type *</label>
          <select id="type" name="type" required defaultValue={dv.type ?? "loan"} className={INPUT}>
            <option value="loan">Loan</option>
            <option value="credit_facility">Credit Facility</option>
            <option value="accounts_payable">Accounts Payable</option>
            <option value="vat_payable">VAT Payable</option>
            <option value="tax_provision">Tax Provision</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="lender" className={LABEL}>Lender / Creditor</label>
          <input id="lender" name="lender" type="text" defaultValue={dv.lender ?? ""}
            placeholder="e.g. FNB, NamRA" className={INPUT} />
        </div>

        <div>
          <label htmlFor="total_amount" className={LABEL}>Total / Limit (R) *</label>
          <input id="total_amount" name="total_amount" type="number" step="0.01" min="0" required
            defaultValue={toDecimal(dv.total_amount)} placeholder="0.00" className={INPUT} />
        </div>

        <div>
          <label htmlFor="outstanding" className={LABEL}>Outstanding Balance (R) *</label>
          <input id="outstanding" name="outstanding" type="number" step="0.01" min="0" required
            defaultValue={toDecimal(dv.outstanding)} placeholder="0.00" className={INPUT} />
        </div>

        <div>
          <label htmlFor="interest_rate" className={LABEL}>Interest Rate (% p.a.)</label>
          <input id="interest_rate" name="interest_rate" type="number" step="0.01" min="0"
            defaultValue={dv.interest_rate != null ? String(dv.interest_rate) : ""}
            placeholder="e.g. 11.75" className={INPUT} />
        </div>

        <div>
          <label htmlFor="due_date" className={LABEL}>Due / Maturity Date</label>
          <input id="due_date" name="due_date" type="date"
            defaultValue={dv.due_date ?? ""} className={INPUT} />
        </div>

        {dv.status !== undefined && (
          <div>
            <label htmlFor="status" className={LABEL}>Status</label>
            <select id="status" name="status" defaultValue={dv.status ?? "active"} className={INPUT}>
              <option value="active">Active</option>
              <option value="settled">Settled</option>
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="notes" className={LABEL}>Notes</label>
          <textarea id="notes" name="notes" rows={2} defaultValue={dv.notes ?? ""}
            className={`${INPUT} resize-none`} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-teal hover:bg-teal-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {pending ? "Saving..." : defaultValues ? "Save Changes" : "Add Liability"}
        </button>
      </div>
    </form>
  );
}
