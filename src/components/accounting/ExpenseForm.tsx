"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import type { Expense, ExpenseCategory, RecurringInterval } from "@/types/database";
import { useToast } from "@/components/ui/ToastProvider";

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: "hosting", label: "Hosting" },
  { value: "software", label: "Software" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "hardware", label: "Hardware" },
  { value: "marketing", label: "Marketing" },
  { value: "transport", label: "Transport" },
  { value: "office", label: "Office" },
  { value: "professional_services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

const intervals: { value: RecurringInterval; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

interface ExpenseFormProps {
  expense?: Expense;
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
  submitLabel: string;
}

export default function ExpenseForm({ expense, action, submitLabel }: ExpenseFormProps) {
  const [recurring, setRecurring] = useState(expense?.recurring || false);
  const toast = useToast();

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = await action(formData);
      if (result?.error) toast.error(result.error);
      else toast.success(expense ? "Expense updated!" : "Expense saved!");
      return result ?? undefined;
    },
    undefined,
  );
  useEffect(() => { if (pending) toast.loading(expense ? "Saving changes..." : "Saving expense..."); }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="glass-card p-6 space-y-5">
      {state?.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{state.error}</div>
      )}

      <div>
        <label htmlFor="description" className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          required
          defaultValue={expense?.description}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-teal focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-xs font-medium text-gray-400 mb-1.5">Amount (R)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={expense ? (expense.amount / 100).toFixed(2) : ""}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-teal focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={expense?.date || new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-teal focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
        <select
          id="category"
          name="category"
          required
          defaultValue={expense?.category || ""}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-teal focus:outline-none"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Recurring */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="recurring"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-card text-teal focus:ring-teal"
          />
          <span className="text-sm text-foreground/60">Recurring expense</span>
        </label>

        {recurring && (
          <div>
            <label htmlFor="recurring_interval" className="block text-xs font-medium text-gray-400 mb-1.5">Interval</label>
            <select
              id="recurring_interval"
              name="recurring_interval"
              defaultValue={expense?.recurring_interval || "monthly"}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-teal focus:outline-none"
            >
              {intervals.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Receipt upload */}
      <div>
        <label htmlFor="receipt" className="block text-xs font-medium text-gray-400 mb-1.5">
          Receipt {expense?.receipt_url ? "(replace existing)" : "(optional)"}
        </label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:bg-card file:text-sm file:text-foreground file:cursor-pointer hover:file:border-teal"
        />
        {expense?.receipt_url && (
          <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:underline mt-1 inline-block">
            View current receipt
          </a>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-gray-400 mb-1.5">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={expense?.notes || ""}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:border-teal focus:outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2 bg-teal hover:bg-teal-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
