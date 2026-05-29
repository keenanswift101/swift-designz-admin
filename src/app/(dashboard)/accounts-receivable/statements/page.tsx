import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";
import GenerateStatementForm from "@/components/ar/GenerateStatementForm";
import DeleteStatementButton from "@/components/ar/DeleteStatementButton";

type Statement = {
  id: string;
  statement_number: string;
  period_type: string;
  period_from: string;
  period_to: string;
  trigger_type: string;
  opening_balance: number;
  total_invoiced: number;
  total_paid: number;
  closing_balance: number;
  sent_at: string | null;
  created_at: string;
  clients: { name: string; company: string | null } | null;
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  client_request: "Client Request",
  project_closure: "Project Closure",
  retainer_monthly: "Retainer Monthly",
  reminders_ignored: "Reminders Ignored",
  financial_year: "Financial Year",
};

export default async function StatementsPage() {
  const supabase = await createClient();

  const [{ data: statements }, { data: clients }, { data: projects }] = await Promise.all([
    supabase
      .from("account_statements")
      .select("id, statement_number, period_type, period_from, period_to, trigger_type, opening_balance, total_invoiced, total_paid, closing_balance, sent_at, created_at, clients(name, company)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name, company").order("name"),
    supabase.from("projects").select("id, name, client_id, start_date, due_date").order("name"),
  ]);

  const rows = (statements ?? []) as unknown as Statement[];
  const totalOutstanding = rows.reduce((s, r) => s + r.closing_balance, 0);
  const totalStatements = rows.length;
  const sentCount = rows.filter((r) => r.sent_at).length;

  return (
    <>
      <PageHeader
        title="Account Statements"
        description="Period-based financial summaries per client"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: list */}
        <div className="lg:col-span-2 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-foreground">{totalStatements}</p>
              <p className="text-xs text-gray-500 mt-1">Total Statements</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-teal">{sentCount}</p>
              <p className="text-xs text-gray-500 mt-1">Sent to Client</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-lg font-bold text-amber-400">{formatCurrency(totalOutstanding)}</p>
              <p className="text-xs text-gray-500 mt-1">Total Outstanding</p>
            </div>
          </div>

          {/* Table */}
          {rows.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center text-center">
              <FileText className="h-10 w-10 text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-400">No statements generated yet</p>
              <p className="text-xs text-gray-600 mt-1">Use the form to generate your first account statement.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoiced</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-5 py-3 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((s) => (
                    <tr key={s.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/accounts-receivable/statements/${s.id}`}
                          className="text-xs font-mono text-teal hover:underline"
                        >
                          {s.statement_number}
                        </Link>
                        {s.sent_at && (
                          <p className="text-xs text-gray-600 mt-0.5">Sent {formatDate(s.sent_at)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground leading-tight">{s.clients?.name ?? "—"}</p>
                        {s.clients?.company && <p className="text-xs text-gray-500">{s.clients.company}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(s.period_from)} — {formatDate(s.period_to)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-border text-gray-400">
                          {TRIGGER_LABELS[s.trigger_type] ?? s.trigger_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-foreground tabular-nums">
                        {formatCurrency(s.total_invoiced)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums">
                        <span className={s.closing_balance > 0 ? "text-amber-400" : "text-teal"}>
                          {formatCurrency(s.closing_balance)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <DeleteStatementButton id={s.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: generate form */}
        <div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4 text-teal" />
              <h2 className="text-sm font-semibold text-foreground">Generate Statement</h2>
            </div>
            <GenerateStatementForm clients={clients ?? []} projects={projects ?? []} />
          </div>
        </div>
      </div>
    </>
  );
}
