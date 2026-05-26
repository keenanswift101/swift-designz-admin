"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronDown, User, Briefcase, X, Check } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import { createQuotationAction, updateQuotationAction } from "@/app/(dashboard)/accounts-receivable/quotations/actions";
import type { QuotationLineItem, QuotationWithJoins, DiscountType, PaymentPlanInstallment } from "@/types/accounts-receivable";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
}

interface Project {
  id: string;
  name: string;
  client_id: string;
}

interface Props {
  clients: Client[];
  projects: Project[];
  existing?: QuotationWithJoins & { line_items: QuotationLineItem[] };
}

const BLANK_ITEM = (): QuotationLineItem => ({
  description: "",
  quantity: 1,
  unit_rate: 0,
  amount: 0,
  sort_order: 0,
});

const PAYMENT_PLAN_TYPES = [
  { value: "full_pay", label: "Full payment on due date" },
  { value: "standard", label: "50% deposit / 50% on delivery" },
  { value: "2_month_flex", label: "2-month flex (50% / 50%)" },
  { value: "3_month_ease", label: "3-month ease (34% / 33% / 33%)" },
  { value: "custom", label: "Custom installments" },
];

function addDays(d: Date, days: number): string {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r.toISOString().split("T")[0];
}

function addMonths(d: Date, months: number): string {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r.toISOString().split("T")[0];
}

function computePresetSchedule(planType: string, total: number): PaymentPlanInstallment[] {
  const today = new Date();
  switch (planType) {
    case "full_pay":
      return [{ label: "Full payment", amount_cents: total, due_date: addDays(today, 14), installment_number: 1 }];
    case "standard": {
      const deposit = Math.round(total * 0.5);
      return [
        { label: "Deposit (50%)", amount_cents: deposit, due_date: addDays(today, 3), installment_number: 1 },
        { label: "Final payment (50%)", amount_cents: total - deposit, due_date: addDays(today, 30), installment_number: 2 },
      ];
    }
    case "2_month_flex": {
      const half = Math.round(total * 0.5);
      return [
        { label: "Month 1 (50%)", amount_cents: half, due_date: addDays(today, 7), installment_number: 1 },
        { label: "Month 2 (50%)", amount_cents: total - half, due_date: addMonths(today, 1), installment_number: 2 },
      ];
    }
    case "3_month_ease": {
      const i1 = Math.round(total * 0.34);
      const i2 = Math.round(total * 0.33);
      return [
        { label: "Month 1 (34%)", amount_cents: i1, due_date: addDays(today, 7), installment_number: 1 },
        { label: "Month 2 (33%)", amount_cents: i2, due_date: addMonths(today, 1), installment_number: 2 },
        { label: "Month 3 (33%)", amount_cents: total - i1 - i2, due_date: addMonths(today, 2), installment_number: 3 },
      ];
    }
    default:
      return [];
  }
}

const DEFAULT_TERMS = `1. This quotation is valid for 10 calendar days from the date of issue.
2. A 50% deposit is required before work commences unless otherwise agreed.
3. The remaining balance is due on project completion/delivery.
4. All prices are quoted in South African Rand (ZAR) and are inclusive of VAT where applicable.
5. Swift Designz retains ownership of all work until payment is received in full.
6. Revisions beyond the agreed scope will be quoted separately.`;

export default function QuotationEditor({ clients, projects, existing }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState(existing?.client_id ?? "");
  const [projectId, setProjectId] = useState(existing?.project_id ?? "");
  const [clientSearch, setClientSearch] = useState(existing?.clients?.name ?? "");
  const [clientOpen, setClientOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  const [items, setItems] = useState<QuotationLineItem[]>(
    existing?.line_items?.length ? existing.line_items : [BLANK_ITEM()]
  );

  const [discountType, setDiscountType] = useState<DiscountType>(existing?.discount_type ?? "percentage");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState(existing?.discount_value?.toString() ?? "0");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [terms, setTerms] = useState(existing?.terms ?? DEFAULT_TERMS);
  const [planEnabled, setPlanEnabled] = useState(existing?.payment_plan_enabled ?? false);
  const [planType, setPlanType] = useState(existing?.payment_plan_type ?? "standard");
  const [planOpen, setPlanOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customInstallments, setCustomInstallments] = useState<{ label: string; amount: string; due_date: string }[]>(
    existing?.payment_plan_schedule?.map((i) => ({
      label: i.label,
      amount: (i.amount_cents / 100).toFixed(2),
      due_date: i.due_date,
    })) ?? [
      { label: "Deposit", amount: "", due_date: "" },
      { label: "Final payment", amount: "", due_date: "" },
    ]
  );

  // Derived: filter projects by selected client
  const clientProjects = projects.filter((p) => p.client_id === clientId);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  function selectClient(c: Client) {
    setClientId(c.id);
    setClientSearch(c.name);
    setClientOpen(false);
    setProjectId(""); // reset project when client changes
  }

  // Line item helpers
  const updateItem = useCallback((idx: number, field: keyof QuotationLineItem, raw: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[idx] };
      if (field === "quantity" || field === "unit_rate") {
        const val = field === "unit_rate"
          ? Math.round(parseFloat(raw as string || "0") * 100) // rand → cents
          : parseFloat(raw as string || "1");
        (item as Record<string, number | string>)[field] = isNaN(val as number) ? 0 : val;
      } else {
        (item as Record<string, number | string>)[field] = raw;
      }
      item.amount = Math.round(item.quantity * item.unit_rate);
      next[idx] = item;
      return next;
    });
  }, []);

  function addItem() {
    setItems((prev) => [...prev, { ...BLANK_ITEM(), sort_order: prev.length }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Totals
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const dv = parseFloat(discountValue || "0") || 0;
  const discountAmount = discountType === "percentage"
    ? Math.round(subtotal * (dv / 100))
    : Math.round(dv * 100);
  const total = subtotal - discountAmount;

  function fmt(cents: number) {
    return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  async function handleSave() {
    if (!clientId) { toast.error("Please select a client"); return; }
    if (items.some((i) => !i.description.trim())) { toast.error("All line items need a description"); return; }
    if (items.length === 0) { toast.error("Add at least one line item"); return; }

    setSaving(true);
    toast.loading("Saving quotation...");

    const paymentPlanSchedule = planEnabled
      ? planType === "custom"
          ? customInstallments
              .filter((r) => r.label && r.amount && r.due_date)
              .map((r, idx) => ({
                label: r.label,
                amount_cents: Math.round(parseFloat(r.amount) * 100),
                due_date: r.due_date,
                installment_number: idx + 1,
              }))
          : computePresetSchedule(planType, total)
      : null;

    const payload = {
      clientId,
      projectId: projectId || null,
      lineItems: items,
      discountType,
      discountValue: dv,
      notes,
      terms,
      paymentPlanEnabled: planEnabled,
      paymentPlanType: planEnabled ? planType : null,
      paymentPlanSchedule,
    };

    try {
      if (existing) {
        const result = await updateQuotationAction(existing.id, payload);
        if (result?.error) { toast.error(result.error); return; }
        toast.success("Quotation updated!");
        router.push(`/accounts-receivable/quotations/${existing.id}`);
      } else {
        const result = await createQuotationAction(payload);
        if ("error" in result) { toast.error(result.error); return; }
        toast.success("Quotation created!");
        router.push(`/accounts-receivable/quotations/${result.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6 pb-24">

      {/* Client & Project — z-10 when open so dropdown escapes backdrop-filter stacking context of cards below */}
      <div className={cn("glass-card p-6 space-y-4", (clientOpen || projectOpen) && "relative z-10")}>
        <h2 className="text-sm font-semibold text-foreground">Client & Project</h2>

        {/* Client dropdown */}
        <div className="relative">
          <label className="block text-xs text-gray-500 mb-1">Client *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => { setClientSearch(e.target.value); setClientOpen(true); setClientId(""); }}
              onFocus={() => setClientOpen(true)}
              onBlur={() => setTimeout(() => setClientOpen(false), 150)}
              placeholder="Search client..."
              className="w-full bg-foreground/5 border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          {clientOpen && filteredClients.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden">
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={() => selectClient(c)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-foreground/5 flex items-center gap-2"
                >
                  <span className="text-foreground font-medium">{c.name}</span>
                  {c.company && <span className="text-gray-500 text-xs">· {c.company}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project dropdown */}
        {clientId && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Project (optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-gray-500" />
              </div>
              <button
                type="button"
                onClick={() => setProjectOpen((o) => !o)}
                onBlur={() => setTimeout(() => setProjectOpen(false), 150)}
                className="w-full bg-foreground/5 border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-left focus:outline-none focus:border-teal/50 transition-colors"
              >
                <span className={projectId ? "text-foreground" : "text-gray-600"}>
                  {clientProjects.find((p) => p.id === projectId)?.name ?? "No project linked"}
                </span>
              </button>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              {projectOpen && (
                <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  <button
                    type="button"
                    onMouseDown={() => { setProjectId(""); setProjectOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-foreground/5"
                  >
                    No project linked
                  </button>
                  {clientProjects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={() => { setProjectId(p.id); setProjectOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground font-medium hover:bg-foreground/5"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Line Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </button>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 text-xs text-gray-500 px-1">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit Rate (R)</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 items-center">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Description of service/item..."
                className="bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50"
              />
              <input
                type="number"
                value={item.quantity}
                min={0.01}
                step={0.01}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                className="bg-foreground/5 border border-border rounded-lg px-2 py-2 text-sm text-foreground text-center focus:outline-none focus:border-teal/50"
              />
              <input
                type="number"
                value={(item.unit_rate / 100).toFixed(2)}
                min={0}
                step={0.01}
                onChange={(e) => updateItem(idx, "unit_rate", e.target.value)}
                className="bg-foreground/5 border border-border rounded-lg px-2 py-2 text-sm text-foreground text-right focus:outline-none focus:border-teal/50"
              />
              <span className="text-sm text-foreground text-right tabular-nums">{fmt(item.amount)}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                disabled={items.length === 1}
                className="p-1 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span className="tabular-nums">{fmt(subtotal)}</span>
          </div>

          {/* Discount row */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 shrink-0">Discount</span>
            {/* Custom discount type picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDiscountOpen((o) => !o)}
                onBlur={() => setTimeout(() => setDiscountOpen(false), 150)}
                className="flex items-center gap-1.5 bg-foreground/5 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none hover:border-teal/50 transition-colors"
              >
                {discountType === "percentage" ? "%" : "R (fixed)"}
                <ChevronDown className="h-3 w-3 text-gray-500" />
              </button>
              {discountOpen && (
                <div className="absolute z-20 top-full mt-1 left-0 w-28 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  {[{ value: "percentage", label: "%" }, { value: "fixed", label: "R (fixed)" }].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onMouseDown={() => { setDiscountType(opt.value as DiscountType); setDiscountOpen(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between",
                        discountType === opt.value ? "text-teal bg-teal/10" : "text-foreground hover:bg-foreground/5"
                      )}
                    >
                      {opt.label}
                      {discountType === opt.value && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              value={discountValue}
              min={0}
              step={discountType === "percentage" ? 1 : 0.01}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-24 bg-foreground/5 border border-border rounded-lg px-2 py-1 text-sm text-foreground text-right focus:outline-none focus:border-teal/50"
            />
            {discountAmount > 0 && (
              <span className="text-sm text-gray-500 ml-auto tabular-nums">-{fmt(discountAmount)}</span>
            )}
          </div>

          <div className="flex justify-between text-base font-semibold text-foreground border-t border-border pt-2">
            <span>Total</span>
            <span className="tabular-nums text-teal">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Plan */}
      <div className={cn("glass-card p-6 space-y-4", planOpen && "relative z-10")}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Payment Plan</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setPlanEnabled(!planEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${planEnabled ? "bg-teal" : "bg-foreground/8"}`}
            >
              <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${planEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-xs text-gray-400">{planEnabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
        {planEnabled && (
          <div className="space-y-3">
            {/* Custom plan type picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPlanOpen((o) => !o)}
                onBlur={() => setTimeout(() => setPlanOpen(false), 150)}
                className="w-full flex items-center justify-between bg-foreground/5 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none hover:border-teal/50 transition-colors"
              >
                <span>{PAYMENT_PLAN_TYPES.find((t) => t.value === planType)?.label ?? "Select plan"}</span>
                <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
              </button>
              {planOpen && (
                <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  {PAYMENT_PLAN_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onMouseDown={() => {
                        setPlanType(t.value);
                        setPlanOpen(false);
                        if (t.value === "custom") setCustomModalOpen(true);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between",
                        planType === t.value ? "text-teal bg-teal/10" : "text-foreground hover:bg-foreground/5"
                      )}
                    >
                      {t.label}
                      {planType === t.value && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Edit custom installments button */}
            {planType === "custom" && (
              <button
                type="button"
                onClick={() => setCustomModalOpen(true)}
                className="text-xs text-teal hover:text-teal/80 transition-colors underline underline-offset-2"
              >
                {customInstallments.length > 0
                  ? `${customInstallments.length} installments configured — edit`
                  : "Configure installments"}
              </button>
            )}

            {/* Preset plan installment preview */}
            {planType !== "custom" && total > 0 && (() => {
              const schedule = computePresetSchedule(planType, total);
              if (!schedule.length) return null;
              return (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-foreground/3 border-b border-border">
                    <p className="text-xs font-medium text-gray-400">Installment Schedule</p>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left px-3 py-2 text-gray-500 font-medium">#</th>
                        <th className="text-left px-3 py-2 text-gray-500 font-medium">Label</th>
                        <th className="text-left px-3 py-2 text-gray-500 font-medium">Due Date</th>
                        <th className="text-right px-3 py-2 text-gray-500 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((inst) => (
                        <tr key={inst.installment_number} className="border-b border-border/30 last:border-0">
                          <td className="px-3 py-2 text-gray-600">{inst.installment_number}</td>
                          <td className="px-3 py-2 text-gray-400">{inst.label}</td>
                          <td className="px-3 py-2 text-gray-400">{inst.due_date}</td>
                          <td className="px-3 py-2 text-right font-semibold text-teal tabular-nums">{fmt(inst.amount_cents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-3 py-2 bg-foreground/3 border-t border-border text-xs text-gray-500">
                    First invoice will be created for <span className="text-teal font-semibold">{fmt(schedule[0].amount_cents)}</span>. Subsequent invoices trigger on their due dates.
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Notes & Terms */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Notes & Terms</h2>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Internal notes (not shown on PDF)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any internal notes or context..."
            className="w-full bg-foreground/5 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Terms & Conditions (shown on PDF)</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={6}
            className="w-full bg-foreground/5 border border-border rounded-lg px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-teal/50 resize-none font-mono"
          />
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-64 right-0 border-t border-border bg-background/95 backdrop-blur-sm px-8 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Total:</span>
          <span className="text-lg font-bold text-teal tabular-nums">{fmt(total)}</span>
          {items.length > 0 && (
            <span className="text-xs text-gray-500">{items.length} line item{items.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/accounts-receivable/quotations")}
            className="px-4 py-2 rounded-lg bg-foreground/5 text-foreground/60 border border-border hover:bg-foreground/8 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-teal/10 text-teal border border-teal/25 hover:bg-teal/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {existing ? "Update Quotation" : "Save as Draft"}
          </button>
        </div>
      </div>

      {/* Custom Installments Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCustomModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Custom Installment Schedule</h3>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rows */}
            <div className="px-6 py-4 space-y-3 max-h-80 overflow-y-auto">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_110px_130px_28px] gap-2 text-xs text-gray-500 px-1">
                <span>Label</span>
                <span>Amount (R)</span>
                <span>Due date</span>
                <span />
              </div>
              {customInstallments.map((inst, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_110px_130px_28px] gap-2 items-center">
                  <input
                    type="text"
                    value={inst.label}
                    onChange={(e) => setCustomInstallments((prev) => prev.map((r, i) => i === idx ? { ...r, label: e.target.value } : r))}
                    placeholder={`Installment ${idx + 1}`}
                    className="bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50"
                  />
                  <input
                    type="number"
                    value={inst.amount}
                    min={0}
                    step={0.01}
                    onChange={(e) => setCustomInstallments((prev) => prev.map((r, i) => i === idx ? { ...r, amount: e.target.value } : r))}
                    placeholder="0.00"
                    className="bg-foreground/5 border border-border rounded-lg px-2 py-2 text-sm text-foreground text-right focus:outline-none focus:border-teal/50"
                  />
                  <input
                    type="date"
                    value={inst.due_date}
                    onChange={(e) => setCustomInstallments((prev) => prev.map((r, i) => i === idx ? { ...r, due_date: e.target.value } : r))}
                    className="bg-foreground/5 border border-border rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:border-teal/50"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomInstallments((prev) => prev.filter((_, i) => i !== idx))}
                    disabled={customInstallments.length === 1}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCustomInstallments((prev) => [...prev, { label: "", amount: "", due_date: "" }])}
                className="inline-flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add installment
              </button>
            </div>

            {/* Footer — running total */}
            <div className="px-6 py-4 border-t border-border bg-foreground/3 space-y-3">
              {(() => {
                const instTotal = customInstallments.reduce((s, r) => s + (parseFloat(r.amount) || 0) * 100, 0);
                const diff = total - Math.round(instTotal);
                return (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Installments total: <span className="text-foreground font-medium tabular-nums">{fmt(Math.round(instTotal))}</span>
                    </span>
                    {diff !== 0 && (
                      <span className={cn("font-medium tabular-nums", diff > 0 ? "text-amber-400" : "text-red-400")}>
                        {diff > 0 ? `R${(diff / 100).toFixed(2)} short` : `R${(Math.abs(diff) / 100).toFixed(2)} over`}
                      </span>
                    )}
                    {diff === 0 && total > 0 && (
                      <span className="text-teal font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" /> Matches total
                      </span>
                    )}
                  </div>
                );
              })()}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-foreground/5 text-foreground/60 border border-border hover:bg-foreground/8 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-teal/10 text-teal border border-teal/25 hover:bg-teal/20 transition-colors text-sm font-medium"
                >
                  <Check className="h-4 w-4" />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
