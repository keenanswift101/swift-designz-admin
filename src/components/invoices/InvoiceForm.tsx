"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { Invoice, InvoiceItem, Client, Project, InvoiceDocType, InstallmentInterval, PaymentPlanType, PaymentPlanInstallment } from "@/types/database";
import { useToast } from "@/components/ui/ToastProvider";
import { formatCurrency } from "@/lib/utils";

const INVOICE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

interface LineItem {
  description: string;
  quantity: number;
  unit_rate: number; // cents
}

interface InvoiceFormProps {
  invoice?: Invoice;
  existingItems?: InvoiceItem[];
  clients: Client[];
  projects: Project[];
  preselectedClientId?: string;
  preselectedProjectId?: string;
  preselectedDocType?: InvoiceDocType;
  action: (formData: FormData) => Promise<{ error: string } | void>;
  submitLabel: string;
}

export default function InvoiceForm({
  invoice,
  existingItems,
  clients,
  projects,
  preselectedClientId,
  preselectedProjectId,
  preselectedDocType,
  action,
  submitLabel,
}: InvoiceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [selectedClientId, setSelectedClientId] = useState(
    invoice?.client_id || preselectedClientId || ""
  );
  const [docType, setDocType] = useState<InvoiceDocType>(invoice?.doc_type || preselectedDocType || "invoice");
  const [paymentPlan, setPaymentPlan] = useState(invoice?.payment_plan_enabled || false);
  const [installmentCount, setInstallmentCount] = useState(invoice?.installment_count || 3);
  const [installmentInterval, setInstallmentInterval] = useState<InstallmentInterval>(
    (invoice?.installment_interval as InstallmentInterval) || "monthly"
  );
  const [planType, setPlanType] = useState<PaymentPlanType | null>(
    (invoice?.payment_plan_type as PaymentPlanType) || null
  );
  const [schedule, setSchedule] = useState<PaymentPlanInstallment[]>(
    invoice?.payment_plan_schedule || []
  );

  const initialItems: LineItem[] = existingItems?.length
    ? existingItems.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unit_rate: it.unit_rate,
      }))
    : [{ description: "", quantity: 1, unit_rate: 0 }];

  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [discountType, setDiscountType] = useState<"percent" | "flat">(
    (invoice?.discount_type as "percent" | "flat") || "flat"
  );
  const [discountValue, setDiscountValue] = useState<number>(() => {
    if (!invoice?.discount_amount) return 0;
    if (invoice.discount_type === "flat") return invoice.discount_amount / 100;
    const iSubtotal = (existingItems || []).reduce((s, it) => s + it.amount, 0);
    if (iSubtotal > 0) return Math.round((invoice.discount_amount / iSubtotal) * 10000) / 100;
    return 0;
  });
  const formRef = useRef<HTMLFormElement>(null);

  // Filter projects by selected client
  const clientProjects = projects.filter((p) => p.client_id === selectedClientId);

  const subtotal = items.reduce((sum, item) => sum + Math.round(item.quantity * item.unit_rate), 0);
  const discountAmount = discountType === "percent"
    ? Math.round(subtotal * Math.min(discountValue, 100) / 100)
    : Math.round(discountValue * 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Payment plan presets matching quote template
  const PLAN_PRESETS: { type: PaymentPlanType; title: string; badge?: string; desc: string; detail: string; generate: (t: number) => PaymentPlanInstallment[] }[] = [
    {
      type: "standard",
      title: "Standard",
      desc: "50% deposit on signing · 50% on launch / delivery",
      detail: "Most popular plan.",
      generate: (t) => [
        { label: "Deposit — 1st Payment", amount: Math.round(t * 0.5) },
        { label: "2nd Payment — On delivery", amount: t - Math.round(t * 0.5) },
      ],
    },
    {
      type: "full_pay",
      title: "Full Pay",
      badge: "Best Value",
      desc: "100% upfront payment",
      detail: "Bonus: 2 months free support (instead of 1).",
      generate: (t) => [
        { label: "Full Payment", amount: t },
      ],
    },
    {
      type: "2_month_flex",
      title: "2-Month Flex",
      desc: "50% deposit · 50% in Month 2",
      detail: "Split into 2 equal halves.",
      generate: (t) => [
        { label: "Deposit — 1st Payment", amount: Math.round(t * 0.5) },
        { label: "2nd Payment — Month 2", amount: t - Math.round(t * 0.5) },
      ],
    },
    {
      type: "3_month_ease",
      title: "3-Month Ease",
      desc: "50% deposit · 25% Month 2 · 25% Month 3",
      detail: "Maximum 3 months. Final payment before launch.",
      generate: (t) => [
        { label: "Deposit — 1st Payment", amount: Math.round(t * 0.5) },
        { label: "2nd Payment — Month 2", amount: Math.round(t * 0.25) },
        { label: "3rd Payment — Month 3", amount: t - Math.round(t * 0.5) - Math.round(t * 0.25) },
      ],
    },
  ];

  function selectPlan(type: PaymentPlanType) {
    setPlanType(type);
    const preset = PLAN_PRESETS.find((p) => p.type === type);
    if (preset) {
      const generated = preset.generate(finalTotal);
      setSchedule(generated);
      setInstallmentCount(generated.length);
      setInstallmentInterval("monthly");
    }
  }

  function updateScheduleAmount(index: number, amountRand: number) {
    const updated = [...schedule];
    updated[index] = { ...updated[index], amount: Math.round(amountRand * 100) };
    setSchedule(updated);
    // When amounts are manually edited, mark as custom if it no longer matches the preset
    if (planType && planType !== "custom") {
      const preset = PLAN_PRESETS.find((p) => p.type === planType);
      if (preset) {
        const expected = preset.generate(finalTotal);
        const matches = expected.length === updated.length && expected.every((e, i) => e.amount === updated[i].amount);
        if (!matches) setPlanType("custom");
      }
    }
  }

  function updateScheduleLabel(index: number, label: string) {
    const updated = [...schedule];
    updated[index] = { ...updated[index], label };
    setSchedule(updated);
  }

  function addScheduleRow() {
    setSchedule([...schedule, { label: `Payment ${schedule.length + 1}`, amount: 0 }]);
    setInstallmentCount(schedule.length + 1);
    setPlanType("custom");
  }

  function removeScheduleRow(index: number) {
    if (schedule.length <= 1) return;
    const updated = schedule.filter((_, i) => i !== index);
    setSchedule(updated);
    setInstallmentCount(updated.length);
    setPlanType("custom");
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit_rate: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = [...items];
    if (field === "description") {
      updated[index].description = value as string;
    } else if (field === "quantity") {
      updated[index].quantity = Math.max(0, Number(value));
    } else if (field === "unit_rate") {
      // Input is in Rand, store as cents
      updated[index].unit_rate = Math.round(Number(value) * 100);
    }
    setItems(updated);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    toast.loading(invoice ? "Saving changes..." : "Creating invoice...");

    // Inject items as JSON
    formData.set("items", JSON.stringify(items));
    formData.set("doc_type", docType);
    formData.set("discount_type", discountType);
    formData.set("discount_amount", String(discountAmount));
    formData.set("payment_plan_enabled", paymentPlan ? "true" : "false");
    if (paymentPlan) {
      formData.set("installment_count", String(installmentCount));
      formData.set("installment_interval", installmentInterval);
      formData.set("payment_plan_type", planType || "custom");
      formData.set("payment_plan_schedule", JSON.stringify(schedule));
    }

    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success(invoice ? "Invoice updated!" : "Invoice created!");
    }
  }

  const inputCls = "w-full px-3 py-2 bg-[#111] border border-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal";
  const labelCls = "block text-xs text-gray-400 mb-1";

  return (
    <form ref={formRef} onSubmit={(e) => { e.preventDefault(); void handleSubmit(new FormData(e.currentTarget)); }} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Document Type Toggle */}
      <div>
        <label className={labelCls}>Document Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDocType("invoice")}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              docType === "invoice"
                ? "bg-teal text-white border-teal"
                : "bg-transparent text-gray-400 border-border hover:border-teal/50"
            }`}
          >
            Invoice
          </button>
          <button
            type="button"
            onClick={() => setDocType("quotation")}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              docType === "quotation"
                ? "bg-teal text-white border-teal"
                : "bg-transparent text-gray-400 border-border hover:border-teal/50"
            }`}
          >
            Quotation
          </button>
        </div>
      </div>

      {/* Client + Project */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Client *</label>
          <select
            name="client_id"
            required
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className={inputCls}
          >
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.company ? ` (${c.company})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Project <span className="text-gray-600">(optional)</span></label>
          <select
            name="project_id"
            defaultValue={invoice?.project_id || preselectedProjectId || ""}
            className={inputCls}
          >
            <option value="">No project</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Due Date *</label>
          <input
            name="due_date"
            type="date"
            required
            defaultValue={invoice?.due_date || ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select
            name="status"
            defaultValue={invoice?.status || "draft"}
            className={inputCls}
          >
            {INVOICE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Income Category */}
      <div>
        <label className={labelCls}>Income Category</label>
        <select
          name="category"
          defaultValue={invoice?.category || "web_dev"}
          className={inputCls}
        >
          <option value="web_dev">Web Development</option>
          <option value="ecommerce">E-Commerce</option>
          <option value="apps">Apps</option>
          <option value="training">Training</option>
          <option value="consulting">Consulting</option>
          <option value="investment">Investment</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Line Items</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-teal hover:text-foreground transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Item
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase tracking-wider w-20">Qty</th>
                <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase tracking-wider w-28">Rate (R)</th>
                <th className="text-right px-3 py-2 text-xs text-gray-500 uppercase tracking-wider w-28">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, i) => {
                const lineAmount = Math.round(item.quantity * item.unit_rate);
                return (
                  <tr key={i}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="Service description"
                        value={item.description}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        className="w-full bg-transparent border-0 text-sm text-foreground placeholder-gray-600 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", e.target.value)}
                        className="w-full bg-transparent border-0 text-sm text-foreground text-center focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_rate / 100}
                        onChange={(e) => updateItem(i, "unit_rate", e.target.value)}
                        className="w-full bg-transparent border-0 text-sm text-foreground text-center focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-foreground/60 font-mono">
                      {formatCurrency(lineAmount)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {discountAmount > 0 && (
                <tr className="border-t border-border/40">
                  <td colSpan={3} className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</td>
                  <td className="px-3 py-2 text-right text-sm text-gray-400 font-mono">{formatCurrency(subtotal)}</td>
                  <td />
                </tr>
              )}
              <tr className="border-t border-border/40">
                <td colSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      type="button"
                      onClick={() => { setDiscountType("percent"); setDiscountValue(0); }}
                      className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                        discountType === "percent" ? "border-teal text-teal bg-teal/10" : "border-border text-gray-500 hover:border-teal/40"
                      }`}
                    >%</button>
                    <button
                      type="button"
                      onClick={() => { setDiscountType("flat"); setDiscountValue(0); }}
                      className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                        discountType === "flat" ? "border-teal text-teal bg-teal/10" : "border-border text-gray-500 hover:border-teal/40"
                      }`}
                    >R</button>
                    <input
                      type="number"
                      step={discountType === "percent" ? "1" : "0.01"}
                      min="0"
                      max={discountType === "percent" ? "100" : undefined}
                      value={discountValue || ""}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-14 bg-transparent border-0 text-sm text-foreground text-center focus:outline-none"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-sm font-mono text-red-400">
                  {discountAmount > 0 ? `- ${formatCurrency(discountAmount)}` : "—"}
                </td>
                <td />
              </tr>
              <tr className="border-t border-border">
                <td colSpan={3} className="px-3 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</td>
                <td className="px-3 py-3 text-right text-sm font-bold text-teal font-mono">
                  {formatCurrency(finalTotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelCls}>Notes <span className="text-gray-600">(optional)</span></label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={invoice?.notes || ""}
          placeholder="Any additional notes..."
          className={inputCls + " resize-none"}
        />
      </div>

      {/* Payment Plan */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={paymentPlan}
              onChange={(e) => {
                setPaymentPlan(e.target.checked);
                if (e.target.checked && schedule.length === 0) selectPlan("standard");
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-teal transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
          <span className="text-sm text-foreground font-medium">Payment Plan</span>
        </div>

        {paymentPlan && (
          <>
            {/* Plan Cards */}
            <div className="grid grid-cols-2 gap-3">
              {PLAN_PRESETS.map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => selectPlan(preset.type)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    planType === preset.type
                      ? "border-teal bg-teal/5 shadow-[0_0_12px_rgba(48,176,176,0.15)]"
                      : "border-border hover:border-teal/40 bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{preset.title}</span>
                    {preset.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-teal text-white rounded">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{preset.desc}</p>
                  <p className="text-[11px] text-gray-500 italic mt-0.5">{preset.detail}</p>
                </button>
              ))}
            </div>

            {/* Editable Schedule Table */}
            {schedule.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Payment Schedule</label>
                  <button
                    type="button"
                    onClick={addScheduleRow}
                    className="flex items-center gap-1 text-xs text-teal hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add Row
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-[#111]">
                        <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">Payment</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase tracking-wider w-36">Amount (R)</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {schedule.map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.label}
                              onChange={(e) => updateScheduleLabel(i, e.target.value)}
                              className="w-full bg-transparent border-0 text-sm text-foreground placeholder-gray-600 focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.amount / 100}
                              onChange={(e) => updateScheduleAmount(i, parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-0 text-sm text-foreground text-right font-mono focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            {schedule.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeScheduleRow(i)}
                                className="text-gray-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Schedule Total</td>
                        <td className="px-3 py-2 text-right text-sm font-mono font-bold text-teal">
                          {formatCurrency(schedule.reduce((s, r) => s + r.amount, 0))}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {(() => {
                  const scheduleTotal = schedule.reduce((s, r) => s + r.amount, 0);
                  const diff = finalTotal - scheduleTotal;
                  if (diff !== 0 && finalTotal > 0) {
                    return (
                      <p className="text-xs text-amber-400 mt-1">
                        Schedule {diff > 0 ? "is short by" : "exceeds total by"} {formatCurrency(Math.abs(diff))}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
