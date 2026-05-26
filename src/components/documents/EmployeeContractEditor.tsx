"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronRight, User } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { createEmployeeContractAction, updateEmployeeContractAction } from "@/app/(dashboard)/documents/employee-contracts/actions";
import type { TempContractContent, EmployeeRef } from "@/types/employee-contract";

// ── Primitives ────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, textarea, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; placeholder?: string;
}) {
  const base = "w-full bg-foreground/5 border border-border rounded-lg text-sm text-foreground px-3 py-2 focus:outline-none focus:border-teal placeholder:text-gray-600 resize-none";
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
            className="flex-1 bg-foreground/5 border border-border rounded-lg text-sm text-foreground px-3 py-2 focus:outline-none focus:border-teal resize-none min-h-[56px]"
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
  contractId?: string;
  initialName?: string;
  initialContent: TempContractContent;
  employees?: EmployeeRef[];
}

export default function EmployeeContractEditor({ contractId, initialName = "", initialContent, employees = [] }: Props) {
  const [name, setName] = useState(initialName);
  const [c, setC] = useState<TempContractContent>(initialContent);
  const [isPending, startTransition] = useTransition();
  const [empSearch, setEmpSearch] = useState("");
  const [empOpen, setEmpOpen] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const selectedEmployee = employees.find(e => e.id === c.employeeDbId) ?? null;

  function selectEmployee(emp: EmployeeRef | null) {
    if (emp) {
      setC(prev => ({
        ...prev,
        employeeDbId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email ?? "",
        employeePhone: emp.phone ?? "",
        jobTitle: prev.jobTitle || emp.role,
        department: prev.department || emp.department,
      }));
    } else {
      setC(prev => ({ ...prev, employeeDbId: undefined, employeeName: "", employeeEmail: "", employeePhone: "" }));
    }
    setEmpOpen(false);
    setEmpSearch("");
  }

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    e.role.toLowerCase().includes(empSearch.toLowerCase())
  );

  function set<K extends keyof TempContractContent>(key: K, value: TempContractContent[K]) {
    setC(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!name.trim()) { toast.error("Please enter a contract name."); return; }
    if (!c.employeeName.trim()) { toast.error("Please enter the employee name."); return; }

    toast.loading(contractId ? "Saving contract..." : "Creating contract...");
    startTransition(async () => {
      if (contractId) {
        const result = await updateEmployeeContractAction(contractId, name, c);
        if (result?.error) { toast.error(result.error); return; }
        toast.success("Contract saved!");
      } else {
        const result = await createEmployeeContractAction(name, "temp", c);
        if (result?.error) { toast.error(result.error); return; }
        toast.success("Contract created!");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-24">

      {/* ── Identity ── */}
      <Section num="—" title="Contract Identity">
        <Field label="Internal name (portal label)" placeholder="e.g. Temp Contract — John Doe"
          value={name} onChange={setName} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Document title" placeholder="Temporary Employment Contract"
            value={c.documentTitle} onChange={v => set("documentTitle", v)} />
          <Field label="Reference number" placeholder="SD-TEC-2026"
            value={c.ref} onChange={v => set("ref", v)} />
          <Field label="Start date" placeholder="01 June 2026"
            value={c.startDate} onChange={v => set("startDate", v)} />
          <Field label="End date" placeholder="31 August 2026"
            value={c.endDate} onChange={v => set("endDate", v)} />
        </div>
        <Field label="Reason for temporary employment" textarea
          placeholder="To fulfil a temporary operational requirement..."
          value={c.reasonForTemp} onChange={v => set("reasonForTemp", v)} />
      </Section>

      {/* ── Employee ── */}
      <Section num="—" title="Employee Details">
        {/* Employee dropdown */}
        {employees.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Link to team member (optional)</label>
            <div className="relative">
              <button type="button" onClick={() => setEmpOpen(o => !o)}
                className="w-full flex items-center gap-2 bg-foreground/5 border border-border rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-teal text-left">
                <User className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                {selectedEmployee
                  ? <span className="flex-1 text-foreground truncate">{selectedEmployee.name} — {selectedEmployee.role}</span>
                  : <span className="flex-1 text-gray-600">Search team members…</span>}
                <ChevronDown className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              </button>
              {empOpen && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input autoFocus placeholder="Search by name or role…"
                      className="w-full bg-foreground/5 border border-border rounded-md text-sm text-foreground px-3 py-1.5 focus:outline-none focus:border-teal"
                      value={empSearch} onChange={e => setEmpSearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <button type="button" onClick={() => selectEmployee(null)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-foreground/5 transition-colors">
                      — None —
                    </button>
                    {filteredEmployees.map(emp => (
                      <button key={emp.id} type="button" onClick={() => selectEmployee(emp)}
                        className={`w-full text-left px-3 py-2 hover:bg-foreground/5 transition-colors ${emp.id === c.employeeDbId ? "bg-teal/10" : ""}`}>
                        <p className="text-sm text-foreground">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.role} · {emp.department}</p>
                      </button>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <p className="px-3 py-3 text-xs text-gray-600">No match.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name" placeholder="Jane Smith"
            value={c.employeeName} onChange={v => set("employeeName", v)} />
          <Field label="ID number" placeholder="SA ID / Passport number"
            value={c.employeeIdNumber} onChange={v => set("employeeIdNumber", v)} />
          <Field label="Email" placeholder="employee@email.com"
            value={c.employeeEmail} onChange={v => set("employeeEmail", v)} />
          <Field label="Phone" placeholder="+27 XX XXX XXXX"
            value={c.employeePhone} onChange={v => set("employeePhone", v)} />
        </div>
        <Field label="Residential address" placeholder="123 Street, City, Province, Postal Code"
          value={c.employeeAddress} onChange={v => set("employeeAddress", v)} />
      </Section>

      {/* ── Position ── */}
      <Section num="—" title="Position Details">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Job title" placeholder="Junior Developer"
            value={c.jobTitle} onChange={v => set("jobTitle", v)} />
          <Field label="Department" placeholder="Development"
            value={c.department} onChange={v => set("department", v)} />
          <Field label="Reporting to" placeholder="Keenan Husselmann"
            value={c.reportingTo} onChange={v => set("reportingTo", v)} />
          <Field label="Work location" placeholder="Remote / Office"
            value={c.workLocation} onChange={v => set("workLocation", v)} />
        </div>
      </Section>

      {/* ── Employer ── */}
      <Section num="—" title="Employer Details" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Employer name" value={c.employerName} onChange={v => set("employerName", v)} />
          <Field label="Trading as" value={c.employerTradingAs} onChange={v => set("employerTradingAs", v)} />
          <Field label="Email" value={c.employerEmail} onChange={v => set("employerEmail", v)} />
          <Field label="Phone" value={c.employerPhone} onChange={v => set("employerPhone", v)} />
          <Field label="Signatory name" value={c.employerRepName} onChange={v => set("employerRepName", v)} />
          <Field label="Signatory title" value={c.employerRepTitle} onChange={v => set("employerRepTitle", v)} />
        </div>
        <Field label="Address" value={c.employerAddress} onChange={v => set("employerAddress", v)} />
      </Section>

      {/* ── Remuneration ── */}
      <Section num="03" title="Remuneration">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Rate amount" placeholder="R5,000" value={c.rateAmount} onChange={v => set("rateAmount", v)} />
          <Field label="Rate period" placeholder="per month / per hour / per day"
            value={c.ratePeriod} onChange={v => set("ratePeriod", v)} />
          <Field label="Payment schedule" placeholder="Last business day of each month"
            value={c.paymentSchedule} onChange={v => set("paymentSchedule", v)} />
          <Field label="Payment method" placeholder="EFT"
            value={c.paymentMethod} onChange={v => set("paymentMethod", v)} />
        </div>
      </Section>

      {/* ── Working Hours ── */}
      <Section num="04" title="Working Hours" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Working hours" placeholder="08:00 to 17:00, Monday to Friday"
            value={c.workingHours} onChange={v => set("workingHours", v)} />
          <Field label="Hours per week" placeholder="45"
            value={c.hoursPerWeek} onChange={v => set("hoursPerWeek", v)} />
        </div>
        <Field label="Overtime terms" textarea value={c.overtimeRate} onChange={v => set("overtimeRate", v)} />
      </Section>

      {/* ── Duties ── */}
      <Section num="05" title="Duties & Responsibilities" defaultOpen={false}>
        <BulletListEditor items={c.duties} onChange={v => set("duties", v)} />
      </Section>

      {/* ── Leave ── */}
      <Section num="06" title="Leave Entitlement" defaultOpen={false}>
        <BulletListEditor items={c.leaveTerms} onChange={v => set("leaveTerms", v)} />
      </Section>

      {/* ── Termination ── */}
      <Section num="07" title="Termination of Employment" defaultOpen={false}>
        <BulletListEditor items={c.terminationTerms} onChange={v => set("terminationTerms", v)} />
      </Section>

      {/* ── Confidentiality ── */}
      <Section num="08" title="Confidentiality" defaultOpen={false}>
        <BulletListEditor items={c.confidentialityTerms} onChange={v => set("confidentialityTerms", v)} />
      </Section>

      {/* ── General Terms ── */}
      <Section num="09" title="General Terms" defaultOpen={false}>
        <BulletListEditor items={c.generalTerms} onChange={v => set("generalTerms", v)} />
      </Section>

      {/* ── Closing ── */}
      <Section num="—" title="Closing Statement" defaultOpen={false}>
        <Field label="Signature block intro" textarea value={c.closingStatement} onChange={v => set("closingStatement", v)} />
      </Section>

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-card/90 backdrop-blur-sm border-t border-border">
        <button type="button" onClick={() => router.push("/documents/employee-contracts")}
          className="text-sm text-gray-500 hover:text-foreground/60 transition-colors">
          ← Back to Contracts
        </button>
        <button type="button" onClick={handleSave} disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors disabled:opacity-50">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {contractId ? "Save Changes" : "Create Contract"}
        </button>
      </div>
    </div>
  );
}
