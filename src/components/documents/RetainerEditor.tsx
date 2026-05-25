"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronRight, User } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { createRetainerAction, updateRetainerAction } from "@/app/(dashboard)/documents/retainers/actions";
import type { RetainerContent, RetainerClient, ServiceItem, ServiceLevel, PaymentTermRow } from "@/types/estore-retainer";

// ── Primitive editors ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, textarea, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; placeholder?: string;
}) {
  const base = "w-full bg-white/5 border border-border rounded-lg text-sm text-foreground px-3 py-2 focus:outline-none focus:border-teal placeholder:text-gray-600 resize-none";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      {textarea
        ? <textarea className={`${base} min-h-[72px]`} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        : <input className={base} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

function BulletListEditor({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-teal mt-2.5 shrink-0 text-base">›</span>
          <textarea
            className="flex-1 bg-white/5 border border-border rounded-lg text-sm text-foreground px-3 py-2 focus:outline-none focus:border-teal resize-none min-h-[56px]"
            value={item}
            onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-1.5 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors self-start mt-1">
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

function ServiceItemEditor({ items, onChange, addLabel = "Add service" }: {
  items: ServiceItem[]; onChange: (v: ServiceItem[]) => void; addLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 p-3 bg-white/3 border border-border/50 rounded-lg">
          <div className="flex-1 flex flex-col gap-2">
            <input placeholder="Service name"
              className="bg-white/5 border border-border rounded-md text-sm text-foreground px-3 py-1.5 focus:outline-none focus:border-teal"
              value={item.title}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }} />
            <textarea placeholder="Description"
              className="bg-white/5 border border-border rounded-md text-sm text-foreground px-3 py-1.5 focus:outline-none focus:border-teal resize-none min-h-[52px]"
              value={item.description}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; onChange(n); }} />
          </div>
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 self-start">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", description: "" }])}
        className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors self-start">
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

function ServiceLevelEditor({ items, onChange }: { items: ServiceLevel[]; onChange: (v: ServiceLevel[]) => void }) {
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
            <input key={field}
              className="bg-white/5 border border-border rounded-md text-xs text-foreground px-2 py-1.5 focus:outline-none focus:border-teal"
              value={row[field]}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], [field]: e.target.value }; onChange(n); }} />
          ))}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { priority: "", issueType: "", response: "", resolution: "" }])}
        className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors self-start mt-1">
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  );
}

function PaymentTermsEditor({ items, onChange }: { items: PaymentTermRow[]; onChange: (v: PaymentTermRow[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((row, i) => (
        <div key={i} className="flex gap-2 items-start p-2 bg-white/3 border border-border/50 rounded-lg">
          <input placeholder="Item"
            className="w-36 shrink-0 bg-white/5 border border-border rounded-md text-xs text-foreground px-2 py-1.5 focus:outline-none focus:border-teal"
            value={row.item}
            onChange={e => { const n = [...items]; n[i] = { ...n[i], item: e.target.value }; onChange(n); }} />
          <textarea placeholder="Detail"
            className="flex-1 bg-white/5 border border-border rounded-md text-xs text-foreground px-2 py-1.5 focus:outline-none focus:border-teal resize-none min-h-[52px]"
            value={row.detail}
            onChange={e => { const n = [...items]; n[i] = { ...n[i], detail: e.target.value }; onChange(n); }} />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { item: "", detail: "" }])}
        className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 transition-colors self-start mt-1">
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────────

function Section({ num, title, children, defaultOpen = true }: {
  num: string; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/3 transition-colors">
        <span className="text-xs font-bold text-teal tracking-widest w-6 shrink-0">{num}</span>
        <span className="text-sm font-semibold text-foreground flex-1 text-left">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" /> : <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 pt-2 border-t border-border/50 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

interface Props {
  retainerId?: string;       // undefined = creating new
  initialName?: string;
  initialContent: RetainerContent;
  clients?: RetainerClient[];
}

export default function RetainerEditor({ retainerId, initialName = "", initialContent, clients = [] }: Props) {
  const [name, setName] = useState(initialName);
  const [c, setC] = useState<RetainerContent>(initialContent);
  const [isPending, startTransition] = useTransition();
  const [clientSearch, setClientSearch] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const selectedClient = clients.find(cl => cl.id === c.clientId) ?? null;

  function selectClient(cl: RetainerClient | null) {
    if (cl) {
      setC(prev => ({ ...prev, clientId: cl.id, clientName: cl.name, clientEmail: cl.email, clientPhone: cl.phone ?? "", clientCompany: cl.company ?? "" }));
    } else {
      setC(prev => ({ ...prev, clientId: undefined, clientName: "", clientEmail: "", clientPhone: "", clientCompany: "" }));
    }
    setClientOpen(false);
    setClientSearch("");
  }

  const filteredClients = clients.filter(cl =>
    cl.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    cl.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (cl.company ?? "").toLowerCase().includes(clientSearch.toLowerCase())
  );

  function set<K extends keyof RetainerContent>(key: K, value: RetainerContent[K]) {
    setC(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!name.trim()) { toast.error("Please enter a retainer name."); return; }
    if (!c.documentTitle.trim()) { toast.error("Please enter a document title for the PDF."); return; }

    startTransition(async () => {
      if (retainerId) {
        const result = await updateRetainerAction(retainerId, name, c);
        if (result?.error) { toast.error(result.error); return; }
        toast.success("Retainer saved successfully.");
      } else {
        const result = await createRetainerAction(name, c);
        if (result?.error) { toast.error(result.error); return; }
        // createRetainerAction redirects to /edit page — no toast needed
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-24">

      {/* ── Identity ── */}
      <Section num="—" title="Retainer Identity">
        <Field label="Internal name (portal label)" placeholder="e.g. eStore Retainer — Client A"
          value={name} onChange={setName} />

        {/* Client selector */}
        {clients.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Client (optional)</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setClientOpen(o => !o)}
                className="w-full flex items-center gap-2 bg-white/5 border border-border rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-teal text-left"
              >
                <User className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                {selectedClient ? (
                  <span className="flex-1 text-foreground truncate">{selectedClient.name}{selectedClient.company ? ` — ${selectedClient.company}` : ""}</span>
                ) : (
                  <span className="flex-1 text-gray-600">Select a client…</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              </button>
              {clientOpen && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      autoFocus
                      placeholder="Search clients…"
                      className="w-full bg-white/5 border border-border rounded-md text-sm text-foreground px-3 py-1.5 focus:outline-none focus:border-teal"
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <button type="button" onClick={() => selectClient(null)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-white/5 transition-colors">
                      — None (no client) —
                    </button>
                    {filteredClients.map(cl => (
                      <button key={cl.id} type="button" onClick={() => selectClient(cl)}
                        className={`w-full text-left px-3 py-2 hover:bg-white/5 transition-colors ${cl.id === c.clientId ? "bg-teal/10" : ""}`}>
                        <p className="text-sm text-foreground">{cl.name}</p>
                        <p className="text-xs text-gray-500">{cl.email}{cl.company ? ` · ${cl.company}` : ""}</p>
                      </button>
                    ))}
                    {filteredClients.length === 0 && (
                      <p className="px-3 py-3 text-xs text-gray-600">No clients match.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {selectedClient && (
              <p className="text-xs text-gray-600 mt-0.5">
                Client details will appear on the PDF — name, email{selectedClient.phone ? ", phone" : ""}{selectedClient.company ? ", company" : ""}.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="PDF document title" placeholder="e.g. eStore Retainer Agreement"
            value={c.documentTitle} onChange={v => set("documentTitle", v)} />
          <Field label="PDF subtitle" placeholder="e.g. Monthly eCommerce Management Contract"
            value={c.documentSubtitle} onChange={v => set("documentSubtitle", v)} />
          <Field label="Document ref" placeholder="SD-ESR-2026"
            value={c.ref} onChange={v => set("ref", v)} />
          <Field label="Effective date" placeholder="May 2026"
            value={c.effectiveDate} onChange={v => set("effectiveDate", v)} />
        </div>
        <Field label="Intro statement" textarea
          placeholder="This Agreement governs the ongoing services..."
          value={c.introText} onChange={v => set("introText", v)} />
      </Section>

      {/* ── Provider ── */}
      <Section num="—" title="Service Provider Details" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Provider name" value={c.providerName} onChange={v => set("providerName", v)} />
          <Field label="Provider title" value={c.providerTitle} onChange={v => set("providerTitle", v)} />
          <Field label="Email" value={c.providerEmail} onChange={v => set("providerEmail", v)} />
          <Field label="Phone" value={c.providerPhone} onChange={v => set("providerPhone", v)} />
          <Field label="Website" value={c.providerWebsite} onChange={v => set("providerWebsite", v)} />
          <Field label="Monthly rate" placeholder="R1,200" value={c.monthlyRate} onChange={v => set("monthlyRate", v)} />
        </div>
      </Section>

      {/* ── Section 01 ── */}
      <Section num="01" title="Included Services">
        <ServiceItemEditor items={c.includedServices} onChange={v => set("includedServices", v)} />
      </Section>

      {/* ── Section 02 ── */}
      <Section num="02" title="Services Not Included" defaultOpen={false}>
        <ServiceItemEditor items={c.excludedServices} onChange={v => set("excludedServices", v)} addLabel="Add excluded service" />
      </Section>

      {/* ── Section 03 ── */}
      <Section num="03" title="Payment Gateway Integration" defaultOpen={false}>
        <BulletListEditor items={c.gatewayTerms} onChange={v => set("gatewayTerms", v)} />
      </Section>

      {/* ── Section 04 ── */}
      <Section num="04" title="Service Level & Response Times" defaultOpen={false}>
        <ServiceLevelEditor items={c.serviceLevels} onChange={v => set("serviceLevels", v)} />
      </Section>

      {/* ── Section 05 ── */}
      <Section num="05" title="Payment Terms" defaultOpen={false}>
        <PaymentTermsEditor items={c.paymentTerms} onChange={v => set("paymentTerms", v)} />
      </Section>

      {/* ── Section 06 ── */}
      <Section num="06" title="Contract Duration & Renewal" defaultOpen={false}>
        <BulletListEditor items={c.durationTerms} onChange={v => set("durationTerms", v)} />
      </Section>

      {/* ── Section 07 ── */}
      <Section num="07" title="Cancellation & Early Exit" defaultOpen={false}>
        <BulletListEditor items={c.cancellationTerms} onChange={v => set("cancellationTerms", v)} />
      </Section>

      {/* ── Section 08 ── */}
      <Section num="08" title="Upgrades & Scope Changes" defaultOpen={false}>
        <BulletListEditor items={c.upgradeTerms} onChange={v => set("upgradeTerms", v)} />
      </Section>

      {/* ── Section 09 ── */}
      <Section num="09" title="Client Responsibilities" defaultOpen={false}>
        <BulletListEditor items={c.clientResponsibilities} onChange={v => set("clientResponsibilities", v)} />
      </Section>

      {/* ── Section 10 ── */}
      <Section num="10" title="Intellectual Property" defaultOpen={false}>
        <BulletListEditor items={c.ipTerms} onChange={v => set("ipTerms", v)} />
      </Section>

      {/* ── Section 11 ── */}
      <Section num="11" title="Limitation of Liability" defaultOpen={false}>
        <BulletListEditor items={c.liabilityTerms} onChange={v => set("liabilityTerms", v)} />
      </Section>

      {/* ── Section 12 ── */}
      <Section num="12" title="General Terms" defaultOpen={false}>
        <BulletListEditor items={c.generalTerms} onChange={v => set("generalTerms", v)} />
      </Section>

      {/* ── Closing ── */}
      <Section num="—" title="Closing Statement" defaultOpen={false}>
        <Field label="Signature block intro" textarea value={c.closingStatement} onChange={v => set("closingStatement", v)} />
      </Section>

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-card/90 backdrop-blur-sm border-t border-border">
        <button type="button" onClick={() => router.push("/documents/retainers")}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Retainers
        </button>
        <button type="button" onClick={handleSave} disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors disabled:opacity-50">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {retainerId ? "Save Changes" : "Create Retainer"}
        </button>
      </div>
    </div>
  );
}
