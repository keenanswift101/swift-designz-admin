"use client";

import { useState } from "react";
import { useConfirm } from "@/hooks/useConfirm";
import {
  createPayrollRunAction,
  approvePayrollRunAction,
  fundPayrollRunAction,
  markPayrollPaidAction,
  deletePayrollRunAction,
} from "./actions";
import { formatCurrency } from "@/lib/utils";
import {
  Plus, ChevronDown, ChevronRight, CheckCircle,
  Banknote, Trash2, Users, Calendar,
} from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

type RunStatus = "draft" | "approved" | "funded" | "paid";

interface Entry {
  id: string;
  employee_name: string;
  role_snapshot: string | null;
  gross_cents: number;
  ssc_employee_cents: number;
  ssc_employer_cents: number;
  net_cents: number;
}

export interface Run {
  id: string;
  period_year: number;
  period_month: number;
  status: RunStatus;
  payroll_company: string | null;
  total_gross_cents: number;
  total_ssc_employee_cents: number;
  total_ssc_employer_cents: number;
  total_net_cents: number;
  total_to_fund_cents: number;
  funded_at: string | null;
  funded_amount_cents: number | null;
  paid_at: string | null;
  notes: string | null;
  payroll_entries: Entry[];
}

interface Employee {
  id: string;
  name: string;
  role: string | null;
  salary: number;
}

const STATUS_STYLES: Record<RunStatus, string> = {
  draft:    "bg-gray-500/15 text-gray-400",
  approved: "bg-blue-500/15 text-blue-400",
  funded:   "bg-amber-500/15 text-amber-400",
  paid:     "bg-green-500/15 text-green-400",
};

const STATUS_LABELS: Record<RunStatus, string> = {
  draft:    "Draft",
  approved: "Approved",
  funded:   "Funded",
  paid:     "Paid",
};

export default function PayrollClient({
  runs,
  employees,
  activeCount,
  monthlyGross,
  ytdFunded,
}: {
  runs: Run[];
  employees: Employee[];
  activeCount: number;
  monthlyGross: number;
  ytdFunded: number;
}) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [expanded, setExpanded] = useState<string | null>(runs[0]?.id ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFundModal, setShowFundModal] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create run form state
  const now = new Date();
  const [createYear, setCreateYear] = useState(now.getFullYear());
  const [createMonth, setCreateMonth] = useState(now.getMonth() + 1);
  const [payrollCompany, setPayrollCompany] = useState("PaySpace");
  const [createNotes, setCreateNotes] = useState("");

  // Fund modal state
  const [fundAmount, setFundAmount] = useState("");
  const [fundDate, setFundDate] = useState(new Date().toISOString().split("T")[0]);

  async function handleCreate() {
    setLoading("create");
    setError(null);
    const res = await createPayrollRunAction(createYear, createMonth, payrollCompany, createNotes);
    setLoading(null);
    if (res.error) { setError(res.error); return; }
    setShowCreate(false);
    setExpanded(res.runId ?? null);
  }

  async function handleApprove(runId: string, label: string) {
    const ok = await confirm(`Approve payroll run for ${label}?`, { variant: "default" });
    if (!ok) return;
    setLoading(runId);
    const res = await approvePayrollRunAction(runId);
    setLoading(null);
    if (res.error) setError(res.error);
  }

  async function handleFund(runId: string) {
    setLoading(runId);
    setError(null);
    const cents = Math.round(parseFloat(fundAmount) * 100);
    const res = await fundPayrollRunAction(runId, cents, new Date(fundDate).toISOString());
    setLoading(null);
    if (res.error) { setError(res.error); return; }
    setShowFundModal(null);
    setFundAmount("");
  }

  async function handlePaid(runId: string, label: string) {
    const ok = await confirm(`Mark ${label} payroll as paid? This confirms the payroll company has disbursed all salaries.`, { variant: "default" });
    if (!ok) return;
    setLoading(runId);
    const res = await markPayrollPaidAction(runId);
    setLoading(null);
    if (res.error) setError(res.error);
  }

  async function handleDelete(runId: string, label: string) {
    const ok = await confirm(`Delete ${label} payroll run? This cannot be undone.`, { variant: "danger" });
    if (!ok) return;
    setLoading(runId);
    const res = await deletePayrollRunAction(runId);
    setLoading(null);
    if (res.error) setError(res.error);
  }

  // Preview SSC totals for create modal
  const previewGross = employees.reduce((s, e) => s + (e.salary ?? 0), 0);
  const previewSscEmp = Math.round(previewGross * 0.009);
  const previewSscEmr = Math.round(previewGross * 0.018);
  const previewToFund = previewGross + previewSscEmr;

  return (
    <>
      {ConfirmDialog}

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 flex justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1">Active Staff</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-teal">{formatCurrency(monthlyGross)}</p>
          <p className="text-xs text-gray-500 mt-1">Monthly Gross</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{formatCurrency(ytdFunded)}</p>
          <p className="text-xs text-gray-500 mt-1">YTD Funded</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{runs.length}</p>
          <p className="text-xs text-gray-500 mt-1">Payroll Runs</p>
        </div>
      </div>

      {/* Active employees preview */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-teal" />
          <h3 className="text-sm font-semibold text-foreground">Active Staff &amp; Salaries</h3>
          <span className="text-xs text-gray-500 ml-auto">SSC employee 0.9% · SSC employer 1.8%</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-border/50">
                <th className="text-left pb-2 font-medium">Name</th>
                <th className="text-left pb-2 font-medium">Role</th>
                <th className="text-right pb-2 font-medium">Gross</th>
                <th className="text-right pb-2 font-medium">SSC (Emp)</th>
                <th className="text-right pb-2 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const sscEmp = Math.round(emp.salary * 0.009);
                return (
                  <tr key={emp.id} className="border-b border-border/30 last:border-0">
                    <td className="py-2 text-foreground font-medium">{emp.name}</td>
                    <td className="py-2 text-gray-500">{emp.role ?? "—"}</td>
                    <td className="py-2 text-right text-foreground">{formatCurrency(emp.salary)}</td>
                    <td className="py-2 text-right text-amber-400">−{formatCurrency(sscEmp)}</td>
                    <td className="py-2 text-right text-teal font-medium">{formatCurrency(emp.salary - sscEmp)}</td>
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-500">No active employees</td></tr>
              )}
            </tbody>
            {employees.length > 0 && (
              <tfoot>
                <tr className="text-xs font-semibold text-foreground border-t border-border/50">
                  <td className="pt-2" colSpan={2}>Total</td>
                  <td className="pt-2 text-right">{formatCurrency(previewGross)}</td>
                  <td className="pt-2 text-right text-amber-400">−{formatCurrency(previewSscEmp)}</td>
                  <td className="pt-2 text-right text-teal">{formatCurrency(previewGross - previewSscEmp)}</td>
                </tr>
                <tr className="text-xs text-gray-500">
                  <td className="pt-1" colSpan={2}>Employer SSC (1.8%)</td>
                  <td className="pt-1 text-right text-red-400" colSpan={3}>+{formatCurrency(previewSscEmr)}</td>
                </tr>
                <tr className="text-xs font-bold text-foreground">
                  <td className="pt-1" colSpan={2}>Total to fund</td>
                  <td className="pt-1 text-right text-teal" colSpan={3}>{formatCurrency(previewToFund)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Payroll runs */}
      <div className="space-y-3">
        {runs.map((run) => {
          const label = `${MONTHS[run.period_month - 1]} ${run.period_year}`;
          const isExpanded = expanded === run.id;
          const busy = loading === run.id;

          return (
            <div key={run.id} className="glass-card overflow-hidden">
              {/* Run header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : run.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
              >
                {isExpanded
                  ? <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
                }
                <div className="flex-1 flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[run.status]}`}>
                    {STATUS_LABELS[run.status]}
                  </span>
                  {run.payroll_company && (
                    <span className="text-xs text-gray-500">via {run.payroll_company}</span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-teal">{formatCurrency(run.total_to_fund_cents)}</p>
                  <p className="text-xs text-gray-500">to fund</p>
                </div>
              </button>

              {/* Run detail */}
              {isExpanded && (
                <div className="border-t border-border/50 px-4 pb-4">
                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-border/30">
                    <div>
                      <p className="text-xs text-gray-500">Gross</p>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(run.total_gross_cents)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">SSC Employee</p>
                      <p className="text-sm text-amber-400">−{formatCurrency(run.total_ssc_employee_cents)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">SSC Employer</p>
                      <p className="text-sm text-red-400">+{formatCurrency(run.total_ssc_employer_cents)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net (take-home)</p>
                      <p className="text-sm text-teal font-semibold">{formatCurrency(run.total_net_cents)}</p>
                    </div>
                  </div>

                  {/* Entries table */}
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b border-border/30">
                          <th className="text-left pb-2 font-medium">Employee</th>
                          <th className="text-left pb-2 font-medium">Role</th>
                          <th className="text-right pb-2 font-medium">Gross</th>
                          <th className="text-right pb-2 font-medium">SSC</th>
                          <th className="text-right pb-2 font-medium">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {run.payroll_entries.map((e) => (
                          <tr key={e.id} className="border-b border-border/20 last:border-0">
                            <td className="py-1.5 text-foreground">{e.employee_name}</td>
                            <td className="py-1.5 text-gray-500">{e.role_snapshot ?? "—"}</td>
                            <td className="py-1.5 text-right text-foreground">{formatCurrency(e.gross_cents)}</td>
                            <td className="py-1.5 text-right text-amber-400">−{formatCurrency(e.ssc_employee_cents)}</td>
                            <td className="py-1.5 text-right text-teal">{formatCurrency(e.net_cents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Funding status */}
                  {run.funded_at && (
                    <p className="mt-3 text-xs text-gray-500">
                      Funded {formatCurrency(run.funded_amount_cents ?? 0)} on {new Date(run.funded_at).toLocaleDateString("en-ZA")}
                    </p>
                  )}
                  {run.paid_at && (
                    <p className="text-xs text-green-400">
                      Paid by {run.payroll_company ?? "payroll company"} on {new Date(run.paid_at).toLocaleDateString("en-ZA")}
                    </p>
                  )}
                  {run.notes && <p className="mt-2 text-xs text-gray-500 italic">{run.notes}</p>}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {run.status === "draft" && (
                      <button
                        onClick={() => handleApprove(run.id, label)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}
                    {run.status === "approved" && (
                      <button
                        onClick={() => {
                          setFundAmount(String((run.total_to_fund_cents / 100).toFixed(2)));
                          setShowFundModal(run.id);
                        }}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                      >
                        <Banknote className="h-3.5 w-3.5" />
                        Mark as Funded
                      </button>
                    )}
                    {run.status === "funded" && (
                      <button
                        onClick={() => handlePaid(run.id, label)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Mark as Paid
                      </button>
                    )}
                    {["draft", "approved"].includes(run.status) && (
                      <button
                        onClick={() => handleDelete(run.id, label)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {runs.length === 0 && (
          <div className="glass-card p-10 text-center">
            <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No payroll runs yet. Create your first run to get started.</p>
          </div>
        )}
      </div>

      {/* Create run modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Create Payroll Run</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Month</label>
                  <select
                    value={createMonth}
                    onChange={(e) => setCreateMonth(Number(e.target.value))}
                    className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-sm text-foreground"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Year</label>
                  <input
                    type="number"
                    value={createYear}
                    onChange={(e) => setCreateYear(Number(e.target.value))}
                    className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Payroll Company</label>
                <input
                  type="text"
                  value={payrollCompany}
                  onChange={(e) => setPayrollCompany(e.target.value)}
                  placeholder="e.g. PaySpace, Sage Payroll"
                  className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-sm text-foreground placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                <textarea
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-sm text-foreground resize-none"
                />
              </div>

              {/* Preview */}
              <div className="rounded-lg bg-teal/5 border border-teal/20 p-3 text-xs space-y-1">
                <p className="text-teal font-medium mb-1">{activeCount} employees · {MONTHS[createMonth - 1]} {createYear}</p>
                <div className="flex justify-between text-gray-400"><span>Total gross</span><span>{formatCurrency(previewGross)}</span></div>
                <div className="flex justify-between text-amber-400"><span>SSC employee (0.9%)</span><span>−{formatCurrency(previewSscEmp)}</span></div>
                <div className="flex justify-between text-red-400"><span>SSC employer (1.8%)</span><span>+{formatCurrency(previewSscEmr)}</span></div>
                <div className="flex justify-between text-teal font-semibold border-t border-teal/20 pt-1 mt-1"><span>Total to fund</span><span>{formatCurrency(previewToFund)}</span></div>
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowCreate(false); setError(null); }}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-border text-gray-400 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading === "create" || activeCount === 0}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-teal text-white font-medium hover:bg-teal/80 transition-colors disabled:opacity-50"
              >
                {loading === "create" ? "Creating..." : "Create Run"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fund modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Mark as Funded</h3>
            <p className="text-xs text-gray-500 mb-4">
              Confirm you have transferred the payroll funds to the payroll company account.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Amount Transferred (N$)</label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  step="0.01"
                  className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Transfer Date</label>
                <input
                  type="date"
                  value={fundDate}
                  onChange={(e) => setFundDate(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowFundModal(null); setError(null); }}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-border text-gray-400 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFund(showFundModal)}
                disabled={!fundAmount || loading === showFundModal}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-500/80 transition-colors disabled:opacity-50"
              >
                {loading === showFundModal ? "Saving..." : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-teal text-white text-sm font-medium shadow-lg hover:bg-teal/80 transition-colors z-40"
      >
        <Plus className="h-4 w-4" />
        New Payroll Run
      </button>
    </>
  );
}
