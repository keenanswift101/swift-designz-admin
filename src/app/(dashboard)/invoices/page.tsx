import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteInvoiceButton from "@/components/invoices/DeleteInvoiceButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, ArrowUpRight, FileText, Plus } from "lucide-react";
import type { Invoice } from "@/types/database";

type InvoiceWithClient = Invoice & { clients: { name: string } | null };

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function InvoicesPage({ searchParams }: Props) {
  const { status: filterStatus } = await searchParams;
  const supabase = await createClient();

  const now = new Date();
  const ytdStart = `${now.getFullYear()}-01-01`;

  const { data: allDocs } = await supabase
    .from("invoices")
    .select("*, clients(name)")
    .neq("doc_type", "quotation")
    .order("created_at", { ascending: false });

  const invoices = (allDocs ?? []) as InvoiceWithClient[];

  // ── KPI stats ──────────────────────────────────────────────
  const activeInvoices = invoices.filter((d) => !["draft", "cancelled"].includes(d.status));
  const ytdInvoices = invoices.filter((d) => !["draft", "cancelled"].includes(d.status) && d.created_at >= ytdStart);

  const ytdBilled = ytdInvoices.reduce((s, i) => s + i.amount, 0);
  const ytdCollected = ytdInvoices.reduce((s, i) => s + i.paid_amount, 0);
  const totalOutstanding = activeInvoices
    .filter((d) => ["sent", "partial", "overdue"].includes(d.status))
    .reduce((s, i) => s + (i.amount - i.paid_amount), 0);
  const overdueCount = invoices.filter((d) => d.status === "overdue").length;

  const totalBilledAll = activeInvoices.reduce((s, i) => s + i.amount, 0);
  const totalCollectedAll = activeInvoices.reduce((s, i) => s + i.paid_amount, 0);
  const collectionRate = totalBilledAll > 0 ? Math.round((totalCollectedAll / totalBilledAll) * 100) : 0;

  // ── Status breakdown counts ────────────────────────────────
  const statusCounts = invoices.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.status] = (acc[inv.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusPills: { label: string; key: string; color: string }[] = [
    { key: "draft",     label: "Draft",     color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
    { key: "sent",      label: "Sent",      color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    { key: "partial",   label: "Partial",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    { key: "overdue",   label: "Overdue",   color: "text-red-400 bg-red-400/10 border-red-400/20" },
    { key: "paid",      label: "Paid",      color: "text-teal bg-teal/10 border-teal/20" },
    { key: "cancelled", label: "Cancelled", color: "text-gray-600 bg-gray-600/10 border-gray-600/20" },
  ].filter(({ key }) => (statusCounts[key] ?? 0) > 0);

  const visibleInvoices = filterStatus
    ? invoices.filter((i) => i.status === filterStatus)
    : invoices;

  return (
    <>
      <PageHeader
        title="Billing"
        description="Invoices, payment tracking, and collection overview"
        actions={
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal/10 text-teal border border-teal/25 hover:bg-teal/20 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Total Outstanding
            </p>
            <p className={`text-5xl font-bold leading-none ${totalOutstanding > 0 ? "text-amber-400" : "text-foreground"}`}>
              {formatCurrency(totalOutstanding)}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-green-400 font-medium">{formatCurrency(ytdBilled)} billed YTD</span>
              <span>&mdash;</span>
              <span className="text-teal font-medium">{formatCurrency(ytdCollected)} collected YTD</span>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-56">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Collection rate</span>
              <span className={`font-medium ${collectionRate >= 80 ? "text-teal" : collectionRate >= 50 ? "text-amber-400" : "text-red-400"}`}>
                {collectionRate}%
              </span>
            </div>
            <div className="h-2 bg-card rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  collectionRate >= 80 ? "bg-teal" : collectionRate >= 50 ? "bg-amber-400" : "bg-red-400"
                }`}
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{formatCurrency(totalCollectedAll)} collected</span>
              <span>{formatCurrency(totalBilledAll)} billed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(ytdBilled)}</p>
          <p className="text-xs text-gray-500 mt-1">Billed YTD</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <CheckCircle2 className="h-5 w-5 text-teal" />
          </div>
          <p className="text-2xl font-bold text-teal">{formatCurrency(ytdCollected)}</p>
          <p className="text-xs text-gray-500 mt-1">Collected YTD</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalOutstanding)}</p>
          <p className="text-xs text-gray-500 mt-1">Outstanding</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <p className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-400" : "text-gray-600"}`}>
            {overdueCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Overdue</p>
        </div>
      </div>

      {/* Status filters */}
      {statusPills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filterStatus && (
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-gray-500/30 bg-gray-500/10 text-gray-400 hover:text-foreground transition-colors"
            >
              ✕ Clear filter
            </Link>
          )}
          {statusPills.map(({ key, label, color }) => {
            const isActive = filterStatus === key;
            return (
              <Link
                key={key}
                href={isActive ? "/invoices" : `/invoices?status=${key}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isActive ? color + " ring-1 ring-current" : color + " opacity-70 hover:opacity-100"
                }`}
              >
                <FileText className="h-3 w-3" />
                {statusCounts[key]} {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Invoices Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {filterStatus
              ? `${filterStatus} · ${visibleInvoices.length} invoice${visibleInvoices.length !== 1 ? "s" : ""}`
              : `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Collected</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {visibleInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500">
                    {filterStatus ? `No ${filterStatus} invoices.` : "No invoices yet."}
                  </td>
                </tr>
              ) : (
                visibleInvoices.map((inv, i) => {
                  const paidPct = inv.amount > 0 ? Math.min(Math.round((inv.paid_amount / inv.amount) * 100), 100) : 0;
                  const isOverdue = inv.status === "overdue";
                  return (
                    <tr
                      key={inv.id}
                      className={`border-b border-border/50 hover:bg-card transition-colors ${
                        isOverdue ? "bg-red-950/20" : i % 2 === 1 ? "bg-card/20" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="text-sm font-mono font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                        >
                          {inv.invoice_number}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {inv.clients?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(inv.created_at.slice(0, 10))}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-foreground text-right whitespace-nowrap">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${paidPct === 100 ? "bg-teal" : "bg-teal/50"}`}
                              style={{ width: `${paidPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0 w-8 text-right">{paidPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <DeleteInvoiceButton id={inv.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
