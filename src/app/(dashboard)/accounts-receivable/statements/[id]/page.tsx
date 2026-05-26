import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

const PERIOD_LABELS: Record<string, string> = {
  custom: "Custom Period",
  monthly: "Monthly",
  "30_days": "Last 30 Days",
  financial_year: "Financial Year",
  project: "Project",
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  client_request: "Client Request",
  project_closure: "Project Closure",
  retainer_monthly: "Retainer Monthly",
  reminders_ignored: "Reminders Ignored",
  financial_year: "Financial Year",
};

export default async function StatementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: stmt } = await supabase
    .from("account_statements")
    .select(`
      id, statement_number, period_type, period_from, period_to, trigger_type,
      opening_balance, total_invoiced, total_paid, closing_balance,
      sent_at, sent_to, notes, created_at,
      clients(id, name, email, phone, company),
      profiles(full_name)
    `)
    .eq("id", id)
    .single();

  if (!stmt) notFound();

  const client = stmt.clients as unknown as { id: string; name: string; email: string; phone: string | null; company: string | null } | null;
  const creator = stmt.profiles as unknown as { full_name: string } | null;

  // Fetch ALL invoices for this client up to period end (pre-period = brought forward, in-period = new)
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, paid_amount, status, created_at, due_date")
    .eq("client_id", client?.id ?? "")
    .lte("created_at", stmt.period_to + "T23:59:59")
    .order("created_at", { ascending: true });

  type InvoiceRow = {
    id: string;
    invoice_number: string;
    amount: number;
    paid_amount: number;
    status: string;
    created_at: string;
    due_date: string | null;
  };

  const allInvoiceRows = (invoices ?? []) as InvoiceRow[];
  const broughtForward = allInvoiceRows.filter((i) => i.created_at < stmt.period_from && i.amount > i.paid_amount);
  const invoiceRows = allInvoiceRows.filter((i) => i.created_at >= stmt.period_from);

  return (
    <>
      <div className="mb-6">
        <Link
          href="/accounts-receivable/statements"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Statements
        </Link>
      </div>

      <PageHeader
        title={stmt.statement_number}
        description={`${PERIOD_LABELS[stmt.period_type] ?? stmt.period_type} · ${formatDate(stmt.period_from)} to ${formatDate(stmt.period_to)}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: invoice breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial summary */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Financial Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Opening Balance</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(stmt.opening_balance)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Invoiced</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(stmt.total_invoiced)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                <p className="text-lg font-bold text-teal tabular-nums">{formatCurrency(stmt.total_paid)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Closing Balance</p>
                <p className={`text-lg font-bold tabular-nums ${stmt.closing_balance > 0 ? "text-amber-400" : "text-teal"}`}>
                  {formatCurrency(stmt.closing_balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Brought forward (pre-period outstanding) */}
          {broughtForward.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Outstanding Brought Forward ({broughtForward.length})
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {broughtForward.map((inv) => (
                    <tr key={inv.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/invoices/${inv.id}`} className="text-xs font-mono text-teal hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(inv.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-border text-gray-400 capitalize">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs tabular-nums text-foreground">{formatCurrency(inv.amount)}</td>
                      <td className="px-5 py-3 text-right text-xs tabular-nums font-semibold text-amber-400">
                        {formatCurrency(inv.amount - inv.paid_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-card/30">
                    <td colSpan={4} className="px-5 py-3 text-xs font-semibold text-gray-400">Opening Balance</td>
                    <td className="px-5 py-3 text-right text-xs font-bold text-amber-400 tabular-nums">
                      {formatCurrency(broughtForward.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Invoices in period */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Invoices in Period ({invoiceRows.length})
              </h2>
            </div>
            {invoiceRows.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">No invoices raised in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoiceRows.map((inv) => (
                    <tr key={inv.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/invoices/${inv.id}`} className="text-xs font-mono text-teal hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(inv.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-border text-gray-400 capitalize">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs tabular-nums text-foreground">{formatCurrency(inv.amount)}</td>
                      <td className="px-5 py-3 text-right text-xs tabular-nums font-semibold text-teal">{formatCurrency(inv.paid_amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-card/30">
                    <td colSpan={3} className="px-5 py-3 text-xs font-semibold text-gray-400">Totals</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-foreground tabular-nums">
                      {formatCurrency(invoiceRows.reduce((s, i) => s + i.amount, 0))}
                    </td>
                    <td className="px-5 py-3 text-right text-xs font-bold text-teal tabular-nums">
                      {formatCurrency(invoiceRows.reduce((s, i) => s + i.paid_amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Statement Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Number</dt>
                <dd className="text-xs font-mono text-teal">{stmt.statement_number}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Period Type</dt>
                <dd className="text-xs text-gray-400">{PERIOD_LABELS[stmt.period_type] ?? stmt.period_type}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Trigger</dt>
                <dd className="text-xs text-gray-400">{TRIGGER_LABELS[stmt.trigger_type] ?? stmt.trigger_type}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Generated</dt>
                <dd className="text-xs text-gray-400">{formatDate(stmt.created_at)}</dd>
              </div>
              {creator && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Generated by</dt>
                  <dd>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal border border-teal/20">
                      {creator.full_name}
                    </span>
                  </dd>
                </div>
              )}
              {stmt.sent_at && (
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-xs text-gray-500 shrink-0">Sent</dt>
                  <dd className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <CheckCircle2 className="h-3 w-3 text-teal shrink-0" />
                      <span className="text-xs text-gray-400">{formatDate(stmt.sent_at)}</span>
                    </div>
                    {stmt.sent_to && <p className="text-xs text-gray-600 mt-0.5">{stmt.sent_to}</p>}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Client */}
          {client && (
            <div className="glass-card p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Client</h2>
              <dl className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{client.name}</p>
                  {client.company && <p className="text-xs text-gray-500">{client.company}</p>}
                </div>
                {client.email && <dd className="text-xs text-gray-400">{client.email}</dd>}
                {client.phone && <dd className="text-xs text-gray-400">{client.phone}</dd>}
                <div className="pt-2">
                  <Link
                    href={`/clients`}
                    className="text-xs text-teal hover:underline"
                  >
                    View all invoices →
                  </Link>
                </div>
              </dl>
            </div>
          )}

          {/* Notes */}
          {stmt.notes && (
            <div className="glass-card p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h2>
              <p className="text-sm text-gray-400 whitespace-pre-wrap">{stmt.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
