"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronDown, User, Briefcase } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { createQuotationAction, updateQuotationAction } from "@/app/(dashboard)/accounts-receivable/quotations/actions";
import type { QuotationLineItem, QuotationWithJoins, DiscountType } from "@/types/accounts-receivable";

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

  const [items, setItems] = useState<QuotationLineItem[]>(
    existing?.line_items?.length ? existing.line_items : [BLANK_ITEM()]
  );

  const [discountType, setDiscountType] = useState<DiscountType>(existing?.discount_type ?? "percentage");
  const [discountValue, setDiscountValue] = useState(existing?.discount_value?.toString() ?? "0");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [terms, setTerms] = useState(existing?.terms ?? DEFAULT_TERMS);
  const [planEnabled, setPlanEnabled] = useState(existing?.payment_plan_enabled ?? false);
  const [planType, setPlanType] = useState(existing?.payment_plan_type ?? "standard");

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
    };

    try {
      if (existing) {
        const result = await updateQuotationAction(existing.id, payload);
        if (result?.error) { toast.error(result.error); return; }
        toast.success("Quotation updated");
        router.push(`/accounts-receivable/quotations/${existing.id}`);
      } else {
        const result = await createQuotationAction(payload);
        if ("error" in result) { toast.error(result.error); return; }
        toast.success("Quotation created");
        router.push(`/accounts-receivable/quotations/${result.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6 pb-24">

      {/* Client & Project */}
      <div className="glass-card p-6 space-y-4">
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
              className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50"
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
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex items-center gap-2"
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
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-teal/50 appearance-none"
              >
                <option value="">No project linked</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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
                className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50"
              />
              <input
                type="number"
                value={item.quantity}
                min={0.01}
                step={0.01}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                className="bg-white/5 border border-border rounded-lg px-2 py-2 text-sm text-foreground text-center focus:outline-none focus:border-teal/50"
              />
              <input
                type="number"
                value={(item.unit_rate / 100).toFixed(2)}
                min={0}
                step={0.01}
                onChange={(e) => updateItem(idx, "unit_rate", e.target.value)}
                className="bg-white/5 border border-border rounded-lg px-2 py-2 text-sm text-foreground text-right focus:outline-none focus:border-teal/50"
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
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="bg-white/5 border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-teal/50"
            >
              <option value="percentage">%</option>
              <option value="fixed">R (fixed)</option>
            </select>
            <input
              type="number"
              value={discountValue}
              min={0}
              step={discountType === "percentage" ? 1 : 0.01}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-24 bg-white/5 border border-border rounded-lg px-2 py-1 text-sm text-foreground text-right focus:outline-none focus:border-teal/50"
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
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Payment Plan</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setPlanEnabled(!planEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${planEnabled ? "bg-teal" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${planEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-xs text-gray-400">{planEnabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
        {planEnabled && (
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-teal/50"
          >
            {PAYMENT_PLAN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
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
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal/50 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Terms & Conditions (shown on PDF)</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={6}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-teal/50 resize-none font-mono text-xs"
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
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 border border-border hover:bg-white/10 transition-colors text-sm"
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
    </div>
  );
}
