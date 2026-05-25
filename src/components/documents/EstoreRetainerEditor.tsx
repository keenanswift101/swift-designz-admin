"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { saveEstoreRetainerOverride } from "@/app/(dashboard)/documents/edit/estore-retainer/actions";
import type { EstoreRetainerContent, ServiceItem, ServiceLevel, PaymentTermRow } from "@/types/estore-retainer";

// ── Small reusable editors ────────────────────────────────────────────────────

function Field({ label, value, onChange, textarea }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  const base = "w-full bg-white/5 border border-border rounded-lg text-sm text-foreground px-3 py-2 focus:outline-none focus:border-teal placeholder:text-gray-600 resize-none";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      {textarea
        ? <textarea className={`${base} min-h-[72px]`} value={value} onChange={e => onChange(e.target.value)} />
        : <input className={base} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

function BulletListEditor({ label, items, onChange }: {
  label: string; items: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-teal mt-2.5 shrink-0">›</span>
          <textarea
            className="flex-1 bg-white/5 border border-border rounded-lg text-sm text-foreground px-3 py-2 focus:outline-none focus:border-teal resize-none min-h-[60px]"
            value={item}
            onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-1.5 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors self-start mt-1"
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

function ServiceItemEditor({ label, items, onChange }: {
  label: string; items: ServiceItem[]; onChange: (v: ServiceItem[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 p-3 bg-white/3 border border-border/50 rounded-lg">
          <div className="flex-1 flex flex-col gap-2">
            <input
              placeholder="Service name"
              className="bg-white/5 border border-border rounded-md text-sm text-foreground px-3 py-1.5 focus:outline-none focus:border-teal"
              value={item.title}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
            />
            <textarea
              placeholder="Description"
              className="bg-white/5 border border-border rounded-md text-sm text-foreground px-3 py-1.5 focus:outline-none focus:border-teal resize-none min-h-[52px]"
              value={item.description}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; onChange(n); }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 self-start"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { title: "", description: "" }])}
        className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors self-start"
      >
        <Plus className="h-3.5 w-3.5" /> Add service
      </button>
    </div>
  );
}

function ServiceLevelEditor({ items, onChange }: {
  items: ServiceLevel[]; onChange: (v: ServiceLevel[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2 px-1">
        {["Priority", "Issue Type", "Response", "Resolution"].map(h => (
          <span key={h} className="text-xs font-semibold text-teal uppercase tracking-wider">{h}</span>
        ))}
      </div>
      {items.map((row, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 p-2 bg-white/3 border border-border/50 rounded-lg items-start">
          {(["priority", "issueType", "response", "resolution"] as const).map(field => (
            <input
              key={field}
              className="bg-white/5 border border-border rounded-md text-xs text-foreground px-2 py-1.5 focus:outline-none focus:border-teal"
              value={row[field]}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], [field]: e.target.value }; onChange(n); }}
            />
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { priority: "", issueType: "", response: "", resolution: "" }])}
        className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors self-start mt-1"
      >
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  );
}

function PaymentTermsEditor({ items, onChange }: {
  items: PaymentTermRow[]; onChange: (v: PaymentTermRow[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((row, i) => (
        <div key={i} className="flex gap-2 items-start p-2 bg-white/3 border border-border/50 rounded-lg">
          <input
            placeholder="Item"
            className="w-36 shrink-0 bg-white/5 border border-border rounded-md text-xs text-foreground px-2 py-1.5 focus:outline-none focus:border-teal"
            value={row.item}
            onChange={e => { const n = [...items]; n[i] = { ...n[i], item: e.target.value }; onChange(n); }}
          />
          <textarea
            placeholder="Detail"
            className="flex-1 bg-white/5 border border-border rounded-md text-xs text-foreground px-2 py-1.5 focus:outline-none focus:border-teal resize-none min-h-[52px]"
            value={row.detail}
            onChange={e => { const n = [...items]; n[i] = { ...n[i], detail: e.target.value }; onChange(n); }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { item: "", detail: "" }])}
        className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors self-start mt-1"
      >
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  );
}

// ── Collapsible section wrapper ───────────────────────────────────────────────

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/3 transition-colors"
      >
        <span className="text-xs font-bold text-teal tracking-widest w-6">{num}</span>
        <span className="text-sm font-semibold text-foreground flex-1 text-left">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-border/50">{children}</div>}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

export default function EstoreRetainerEditor({ initialContent }: { initialContent: EstoreRetainerContent }) {
  const [c, setC] = useState<EstoreRetainerContent>(initialContent);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function set<K extends keyof EstoreRetainerContent>(key: K, value: EstoreRetainerContent[K]) {
    setC(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveEstoreRetainerOverride(c);
        toast.success("Document saved. PDF will regenerate on next view.");
      } catch {
        toast.error("Failed to save. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* ── Document meta ── */}
      <Section num="—" title="Document Info & Provider Details">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Field label="Document Ref" value={c.ref} onChange={v => set("ref", v)} />
          <Field label="Effective Date" value={c.effectiveDate} onChange={v => set("effectiveDate", v)} />
          <Field label="Provider Name" value={c.providerName} onChange={v => set("providerName", v)} />
          <Field label="Provider Title" value={c.providerTitle} onChange={v => set("providerTitle", v)} />
          <Field label="Provider Email" value={c.providerEmail} onChange={v => set("providerEmail", v)} />
          <Field label="Provider Phone" value={c.providerPhone} onChange={v => set("providerPhone", v)} />
          <Field label="Provider Website" value={c.providerWebsite} onChange={v => set("providerWebsite", v)} />
          <Field label="Monthly Rate" value={c.monthlyRate} onChange={v => set("monthlyRate", v)} />
        </div>
        <div className="mt-4">
          <Field label="Intro Statement" value={c.introText} onChange={v => set("introText", v)} textarea />
        </div>
      </Section>

      {/* ── Section 01 ── */}
      <Section num="01" title="Retainer Rate & Included Services">
        <div className="mt-2">
          <ServiceItemEditor label="Included services" items={c.includedServices} onChange={v => set("includedServices", v)} />
        </div>
      </Section>

      {/* ── Section 02 ── */}
      <Section num="02" title="Services Not Included">
        <div className="mt-2">
          <ServiceItemEditor label="Excluded services" items={c.excludedServices} onChange={v => set("excludedServices", v)} />
        </div>
      </Section>

      {/* ── Section 03 ── */}
      <Section num="03" title="Payment Gateway Integration">
        <div className="mt-2">
          <BulletListEditor label="Terms" items={c.gatewayTerms} onChange={v => set("gatewayTerms", v)} />
        </div>
      </Section>

      {/* ── Section 04 ── */}
      <Section num="04" title="Service Level & Response Times">
        <div className="mt-2">
          <ServiceLevelEditor items={c.serviceLevels} onChange={v => set("serviceLevels", v)} />
        </div>
      </Section>

      {/* ── Section 05 ── */}
      <Section num="05" title="Payment Terms">
        <div className="mt-2">
          <PaymentTermsEditor items={c.paymentTerms} onChange={v => set("paymentTerms", v)} />
        </div>
      </Section>

      {/* ── Section 06 ── */}
      <Section num="06" title="Contract Duration & Renewal">
        <div className="mt-2">
          <BulletListEditor label="Terms" items={c.durationTerms} onChange={v => set("durationTerms", v)} />
        </div>
      </Section>

      {/* ── Section 07 ── */}
      <Section num="07" title="Cancellation & Early Exit">
        <div className="mt-2">
          <BulletListEditor label="Terms" items={c.cancellationTerms} onChange={v => set("cancellationTerms", v)} />
        </div>
      </Section>

      {/* ── Section 08 ── */}
      <Section num="08" title="Retainer Upgrades & Scope Changes">
        <div className="mt-2">
          <BulletListEditor label="Terms" items={c.upgradeTerms} onChange={v => set("upgradeTerms", v)} />
        </div>
      </Section>

      {/* ── Section 09 ── */}
      <Section num="09" title="Client Responsibilities">
        <div className="mt-2">
          <BulletListEditor label="Responsibilities" items={c.clientResponsibilities} onChange={v => set("clientResponsibilities", v)} />
        </div>
      </Section>

      {/* ── Section 10 ── */}
      <Section num="10" title="Intellectual Property">
        <div className="mt-2">
          <BulletListEditor label="Terms" items={c.ipTerms} onChange={v => set("ipTerms", v)} />
        </div>
      </Section>

      {/* ── Section 11 ── */}
      <Section num="11" title="Limitation of Liability">
        <div className="mt-2">
          <BulletListEditor label="Terms" items={c.liabilityTerms} onChange={v => set("liabilityTerms", v)} />
        </div>
      </Section>

      {/* ── Section 12 ── */}
      <Section num="12" title="General Terms">
        <div className="mt-2">
          <BulletListEditor label="Terms" items={c.generalTerms} onChange={v => set("generalTerms", v)} />
        </div>
      </Section>

      {/* ── Closing statement ── */}
      <Section num="—" title="Closing / Signature Statement">
        <div className="mt-2">
          <Field label="Closing statement" value={c.closingStatement} onChange={v => set("closingStatement", v)} textarea />
        </div>
      </Section>

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-end px-6 py-4 bg-card/80 backdrop-blur-sm border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save & Regenerate PDF
        </button>
      </div>
    </div>
  );
}
