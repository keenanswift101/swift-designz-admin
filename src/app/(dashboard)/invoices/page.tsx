import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteInvoiceButton from "@/components/invoices/DeleteInvoiceButton";
import SendReceiptButton from "@/components/invoices/SendReceiptButton";
import SendRetainerReceiptButton from "@/components/ar/SendRetainerReceiptButton";
import SendInvestorReceiptButton from "@/components/investors/SendInvestorReceiptButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  TrendingUp, Clock, AlertTriangle, CheckCircle2, ArrowUpRight,
  FileText, RefreshCw, TrendingUp as InvestorIcon,
} from "lucide-react";
import type { Invoice } from "@/types/database";
import RemindersTab from "./_tabs/RemindersTab";
import StatementsTab from "./_tabs/StatementsTab";
import RetainersTab from "./_tabs/RetainersTab";
import InboxScanTab from "./_tabs/InboxScanTab";

type InvoiceWithClient = Invoice & { clients: { name: string } | null };

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function InvoicesPage({ searchParams }: Props) {
  const { status: filterStatus, tab } = await searchParams;
  const isPaymentsTab = tab === "payments";
  const supabase = await createClient();

  // ── Always fetch invoice data ──────────────────────────────
  const { data: allDocs } = await supabase
    .from("invoices")
    .select("*, clients(name)")
    .neq("doc_type", "quotation")
    .order("created_at", { ascending: false });

  const invoices = (allDocs ?? []) as InvoiceWithClient[];

  // ── Plan-aware status ──────────────────────────────────────
  const planPaidByQuotation = new Map<string, number>();
  const planTotalByQuotation = new Map<string, number>();
  for (const inv of invoices) {
    if (inv.quotation_id && inv.payment_plan_enabled) {
      planPaidByQuotation.set(inv.quotation_id, (planPaidByQuotation.get(inv.quotation_id) ?? 0) + inv.paid_amount);
      if (!planTotalByQuotation.has(inv.quotation_id)) {
        type SchedRow = { amount_cents?: number; amount?: number };
        const sched = (inv.payment_plan_schedule as SchedRow[] | null) ?? [];
        planTotalByQuotation.set(inv.quotation_id, sched.reduce((s, it) => s + (it.amount_cents ?? it.amount ?? 0), 0));
      }
    }
  }
  function effectiveStatus(inv: InvoiceWithClient): string {
    if (inv.quotation_id && inv.payment_plan_enabled && inv.status === "paid") {
      const planPaid = planPaidByQuotation.get(inv.quotation_id) ?? 0;
      const planTotal = planTotalByQuotation.get(inv.quotation_id) ?? 0;
      if (planTotal > 0 && planPaid < planTotal) return "partial";
    }
    return inv.status;
  }

  // ── Invoice KPIs ───────────────────────────────────────────
  const now = new Date();
  const ytdStart = `${now.getFullYear()}-01-01`;
  const activeInvoices = invoices.filter((d) => !["draft", "cancelled"].includes(d.status));
  const ytdInvoices = invoices.filter((d) => !["draft", "cancelled"].includes(d.status) && d.created_at >= ytdStart);
  const ytdBilled = ytdInvoices.reduce((s, i) => s + i.amount, 0);
  const ytdCollected = ytdInvoices.reduce((s, i) => s + i.paid_amount, 0);
  const countedPlanOutstanding = new Set<string>();
  const totalOutstanding = activeInvoices
    .filter((d) => ["sent", "partial", "overdue"].includes(effectiveStatus(d)))
    .reduce((s, inv) => {
      if (inv.quotation_id && inv.payment_plan_enabled && effectiveStatus(inv) === "partial") {
        if (countedPlanOutstanding.has(inv.quotation_id)) return s;
        countedPlanOutstanding.add(inv.quotation_id);
        const planPaid = planPaidByQuotation.get(inv.quotation_id) ?? 0;
        const planTotal = planTotalByQuotation.get(inv.quotation_id) ?? 0;
        return s + Math.max(0, planTotal - planPaid);
      }
      return s + (inv.amount - inv.paid_amount);
    }, 0);
  const overdueCount = invoices.filter((d) => effectiveStatus(d) === "overdue").length;
  const totalBilledAll = activeInvoices.reduce((s, i) => s + i.amount, 0);
  const totalCollectedAll = activeInvoices.reduce((s, i) => s + i.paid_amount, 0);
  const collectionRate = totalBilledAll > 0 ? Math.round((totalCollectedAll / totalBilledAll) * 100) : 0;
  const statusCounts = invoices.reduce<Record<string, number>>((acc, inv) => {
    const eff = effectiveStatus(inv);
    acc[eff] = (acc[eff] ?? 0) + 1;
    return acc;
  }, {});
  const statusPills = [
    { key: "draft",     label: "Draft",     color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
    { key: "sent",      label: "Sent",      color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    { key: "partial",   label: "Partial",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    { key: "overdue",   label: "Overdue",   color: "text-red-400 bg-red-400/10 border-red-400/20" },
    { key: "paid",      label: "Paid",      color: "text-teal bg-teal/10 border-teal/20" },
    { key: "cancelled", label: "Cancelled", color: "text-gray-600 bg-gray-600/10 border-gray-600/20" },
  ].filter(({ key }) => (statusCounts[key] ?? 0) > 0);
  const visibleInvoices = filterStatus
    ? invoices.filter((i) => effectiveStatus(i) === filterStatus)
    : invoices;

  // ── Payments tab data (only fetched when active) ───────────
  type PaymentRow =
    | { type: "invoice"; id: string; date: string; clientName: string; clientEmail: string; clientCompany: string | null; reference: string | null; method: string; amount: number; receiptNumber: string | null; sentAt: string | null; invoiceId: string; invoiceNumber: string; invoiceTotal: number; invoicePaidTotal: number }
    | { type: "retainer"; id: string; date: string; clientName: string; clientEmail: string; clientCompany: string | null; reference: string | null; method: string; amount: number; receiptNumber: string | null; sentAt: string | null; retainerName: string }
    | { type: "investor"; id: string; date: string; clientName: string; clientEmail: string; clientCompany: string | null; reference: string | null; method: string; amount: number; receiptNumber: string | null; sentAt: string | null; description: string };

  let paymentRows: PaymentRow[] = [];
  let invoicePaymentsCount = 0, retainerPaymentsCount = 0, investorCount = 0, receiptsSent = 0;

  if (isPaymentsTab) {
    const [
      { data: payments },
      { data: confirmations },
      { data: retainerPayments },
      { data: investorContributions },
    ] = await Promise.all([
      supabase.from("payments").select(`id, amount, method, reference, paid_at, invoices(id, invoice_number, amount, paid_amount, clients(name, email, company))`).order("paid_at", { ascending: false }),
      supabase.from("payment_confirmations").select("payment_id, receipt_number, sent_at"),
      supabase.from("retainer_payments").select(`id, amount, payment_method, payment_date, reference, receipt_number, sent_at, retainer_subscriptions(name, clients(name, email, company))`).order("payment_date", { ascending: false }),
      supabase.from("income_entries").select(`id, amount, description, date, receipt_number, sent_at, investors(id, name, email)`).eq("source", "investor").order("date", { ascending: false }),
    ]);

    const sentMap = new Map((confirmations ?? []).map((c) => [c.payment_id, { receiptNumber: c.receipt_number, sentAt: c.sent_at as string | null }]));

    const invoiceRows: PaymentRow[] = ((payments ?? []) as unknown as { id: string; amount: number; method: string; reference: string | null; paid_at: string; invoices: { id: string; invoice_number: string; amount: number; paid_amount: number; clients: { name: string; email: string; company: string | null } | null } | null }[]).map((p) => {
      const conf = sentMap.get(p.id);
      const client = p.invoices?.clients;
      return { type: "invoice", id: p.id, date: p.paid_at, clientName: client?.name ?? "—", clientEmail: client?.email ?? "", clientCompany: client?.company ?? null, reference: p.reference, method: p.method, amount: p.amount, receiptNumber: conf?.receiptNumber ?? null, sentAt: conf?.sentAt ?? null, invoiceId: p.invoices?.id ?? "", invoiceNumber: p.invoices?.invoice_number ?? "—", invoiceTotal: p.invoices?.amount ?? 0, invoicePaidTotal: p.invoices?.paid_amount ?? 0 };
    });

    const retainerRows: PaymentRow[] = ((retainerPayments ?? []) as unknown as { id: string; amount: number; payment_method: string; payment_date: string; reference: string | null; receipt_number: string | null; sent_at: string | null; retainer_subscriptions: { name: string; clients: { name: string; email: string; company: string | null } | null } | null }[]).map((p) => {
      const sub = p.retainer_subscriptions;
      const client = sub?.clients;
      return { type: "retainer", id: p.id, date: p.payment_date, clientName: client?.name ?? "—", clientEmail: client?.email ?? "", clientCompany: client?.company ?? null, reference: p.reference, method: p.payment_method, amount: p.amount, receiptNumber: p.receipt_number, sentAt: p.sent_at, retainerName: sub?.name ?? "Retainer" };
    });

    const investorRows: PaymentRow[] = ((investorContributions ?? []) as unknown as { id: string; amount: number; description: string; date: string; receipt_number: string | null; sent_at: string | null; investors: { id: string; name: string; email: string | null } | null }[]).map((e) => {
      const inv = e.investors;
      return { type: "investor", id: e.id, date: e.date, clientName: inv?.name ?? "—", clientEmail: inv?.email ?? "", clientCompany: null, reference: null, method: "eft", amount: e.amount, receiptNumber: e.receipt_number, sentAt: e.sent_at, description: e.description };
    });

    paymentRows = [...invoiceRows, ...retainerRows, ...investorRows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    invoicePaymentsCount = invoiceRows.length;
    retainerPaymentsCount = retainerRows.length;
    investorCount = investorRows.length;
    receiptsSent = paymentRows.filter((r) => r.sentAt).length;
  }

  // ── Tab styles ─────────────────────────────────────────────
  const tabBase = "px-4 py-2 text-sm font-medium rounded-lg transition-colors";
  const tabActive = "bg-teal/10 text-teal border border-teal/30";
  const tabInactive = "text-gray-400 hover:text-foreground border border-transparent";

  return (
    <>
      <PageHeader title="Billing" description="Invoices, payment tracking, and collection overview" />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 -mb-px">
        {[
          { key: undefined,      label: "Invoices"   },
          { key: "payments",     label: "Payments"   },
          { key: "reminders",    label: "Reminders"  },
          { key: "statements",   label: "Statements" },
          { key: "retainers",    label: "Retainers"  },
          { key: "inbox",        label: "Inbox Scan" },
        ].map(({ key, label }) => {
          const isActive = tab === key || (!tab && !key);
          const href = key ? `/invoices?tab=${key}` : "/invoices";
          return (
            <Link key={label} href={href} className={`${tabBase} whitespace-nowrap ${isActive ? tabActive : tabInactive}`}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── INVOICES TAB ────────────────────────────────────── */}
      {(!tab || tab === "invoices") && (
        <>
          {/* Hero */}
          <div className="glass-card p-6 mb-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Outstanding</p>
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
                  <span className={`font-medium ${collectionRate >= 80 ? "text-teal" : collectionRate >= 50 ? "text-amber-400" : "text-red-400"}`}>{collectionRate}%</span>
                </div>
                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${collectionRate >= 80 ? "bg-teal" : collectionRate >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.min(collectionRate, 100)}%` }} />
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
              <div className="flex items-start justify-between mb-3"><TrendingUp className="h-5 w-5 text-green-400" /></div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(ytdBilled)}</p>
              <p className="text-xs text-gray-500 mt-1">Billed YTD</p>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between mb-3"><CheckCircle2 className="h-5 w-5 text-teal" /></div>
              <p className="text-2xl font-bold text-teal">{formatCurrency(ytdCollected)}</p>
              <p className="text-xs text-gray-500 mt-1">Collected YTD</p>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between mb-3"><Clock className="h-5 w-5 text-amber-400" /></div>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalOutstanding)}</p>
              <p className="text-xs text-gray-500 mt-1">Outstanding</p>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between mb-3"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
              <p className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-400" : "text-gray-600"}`}>{overdueCount}</p>
              <p className="text-xs text-gray-500 mt-1">Overdue</p>
            </div>
          </div>

          {/* Status filters */}
          {statusPills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filterStatus && (
                <Link href="/invoices" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-gray-500/30 bg-gray-500/10 text-gray-400 hover:text-foreground transition-colors">
                  ✕ Clear filter
                </Link>
              )}
              {statusPills.map(({ key, label, color }) => {
                const isActive = filterStatus === key;
                return (
                  <Link key={key} href={isActive ? "/invoices" : `/invoices?status=${key}`} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${isActive ? color + " ring-1 ring-current" : color + " opacity-70 hover:opacity-100"}`}>
                    <FileText className="h-3 w-3" />
                    {statusCounts[key]} {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Invoices table */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {filterStatus ? `${filterStatus} · ${visibleInvoices.length} invoice${visibleInvoices.length !== 1 ? "s" : ""}` : `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
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
                <tbody className="divide-y divide-border">
                  {visibleInvoices.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500">{filterStatus ? `No ${filterStatus} invoices.` : "No invoices yet."}</td></tr>
                  ) : (
                    visibleInvoices.map((inv) => {
                      const isInstallment = !!(inv.quotation_id && inv.payment_plan_enabled);
                      const planPaid = isInstallment ? (planPaidByQuotation.get(inv.quotation_id!) ?? inv.paid_amount) : inv.paid_amount;
                      const planTotal = isInstallment ? (planTotalByQuotation.get(inv.quotation_id!) ?? inv.amount) : inv.amount;
                      const paidPct = planTotal > 0 ? Math.min(Math.round((planPaid / planTotal) * 100), 100) : 0;
                      const effStatus = effectiveStatus(inv);
                      type SchedRow = { installment_number?: number };
                      const schedLen = isInstallment ? ((inv.payment_plan_schedule as SchedRow[] | null) ?? []).length : 0;
                      return (
                        <tr key={inv.id} className={`hover:bg-card/50 transition-colors ${effStatus === "overdue" ? "bg-red-500/5" : ""}`}>
                          <td className="px-5 py-3">
                            <Link href={`/invoices/${inv.id}`} className="text-sm font-mono font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1">
                              {inv.invoice_number}<ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                            </Link>
                            {isInstallment && schedLen > 1 && <p className="text-xs text-gray-600 mt-0.5">Instalment {inv.installment_number} of {schedLen}</p>}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/60">{inv.clients?.name ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(inv.created_at.slice(0, 10))}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <p className="text-sm font-mono font-medium text-foreground">{formatCurrency(inv.amount)}</p>
                            {isInstallment && schedLen > 1 && planTotal > inv.amount && <p className="text-xs text-gray-600 tabular-nums">of {formatCurrency(planTotal)}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${paidPct === 100 ? "bg-teal" : "bg-teal/50"}`} style={{ width: `${paidPct}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 shrink-0 w-8 text-right">{paidPct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={effStatus} /></td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right whitespace-nowrap">{formatDate(inv.due_date)}</td>
                          <td className="px-5 py-3 text-right"><DeleteInvoiceButton id={inv.id} /></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── REMINDERS TAB ───────────────────────────────────── */}
      {tab === "reminders" && <RemindersTab />}

      {/* ── STATEMENTS TAB ──────────────────────────────────── */}
      {tab === "statements" && <StatementsTab />}

      {/* ── RETAINERS TAB ───────────────────────────────────── */}
      {tab === "retainers" && <RetainersTab />}

      {/* ── INBOX SCAN TAB ──────────────────────────────────── */}
      {tab === "inbox" && <InboxScanTab />}

      {/* ── PAYMENTS TAB ────────────────────────────────────── */}
      {isPaymentsTab && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="glass-card p-5">
              <p className="text-lg font-bold text-teal tabular-nums">{formatCurrency(paymentRows.reduce((s, r) => s + r.amount, 0))}</p>
              <p className="text-xs text-gray-500 mt-1">Total Received</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-foreground">{invoicePaymentsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Invoice Payments</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-foreground">{retainerPaymentsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Retainer Payments</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-foreground">{investorCount}</p>
              <p className="text-xs text-gray-500 mt-1">Investor Contributions</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-foreground">{receiptsSent}<span className="text-sm text-gray-500 font-normal"> / {paymentRows.length}</span></p>
              <p className="text-xs text-gray-500 mt-1">Receipts Sent</p>
            </div>
          </div>

          {paymentRows.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center text-center">
              <CheckCircle2 className="h-10 w-10 text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-400">No payments recorded yet</p>
              <p className="text-xs text-gray-600 mt-1">Payments appear here once recorded on an invoice, retainer, or investor.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client / Investor</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                      <th className="px-5 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paymentRows.map((row) => (
                      <tr key={`${row.type}-${row.id}`} className="hover:bg-card/50 transition-colors">
                        <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(row.date)}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground leading-tight">{row.clientName}</p>
                          {row.clientCompany && <p className="text-xs text-gray-500">{row.clientCompany}</p>}
                          {row.type === "investor" && <p className="text-xs text-purple-400 font-medium mt-0.5">Investor</p>}
                        </td>
                        <td className="px-4 py-3">
                          {row.type === "invoice" ? (
                            row.invoiceId ? (
                              <Link href={`/invoices/${row.invoiceId}`} className="text-xs text-teal hover:underline font-mono">{row.invoiceNumber}</Link>
                            ) : <span className="text-xs text-gray-500">—</span>
                          ) : row.type === "retainer" ? (
                            <div className="flex items-center gap-1.5">
                              <RefreshCw className="h-3 w-3 text-teal shrink-0" />
                              <span className="text-xs text-teal font-medium">{row.retainerName}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <InvestorIcon className="h-3 w-3 text-purple-400 shrink-0" />
                              <span className="text-xs text-purple-400 font-medium truncate max-w-35" title={row.description}>{row.description}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 capitalize">{row.method}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-foreground tabular-nums">{formatCurrency(row.amount)}</td>
                        <td className="px-4 py-3">
                          {row.receiptNumber ? (
                            row.type === "invoice" ? (
                              <a href={`/api/docs/receipts/${row.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                                {row.sentAt ? <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0" /> : <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                                <span className={`text-xs font-mono underline underline-offset-2 ${row.sentAt ? "text-teal" : "text-amber-400"}`}>{row.receiptNumber}</span>
                              </a>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                {row.sentAt ? <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0" /> : <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                                <span className={`text-xs font-mono ${row.sentAt ? "text-teal" : "text-amber-400"}`}>{row.receiptNumber}</span>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                              <span className="text-xs text-gray-600">Not sent</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {!row.sentAt && row.type === "invoice" && (
                            <SendReceiptButton paymentId={row.id} previewData={{ clientName: row.clientName, clientEmail: row.clientEmail, clientCompany: row.clientCompany, invoiceNumber: row.invoiceNumber, paymentAmount: row.amount, paymentMethod: row.method, paymentReference: row.reference, paymentDate: row.date, invoiceTotal: row.invoiceTotal, invoicePaidTotal: row.invoicePaidTotal }} />
                          )}
                          {!row.sentAt && row.type === "retainer" && row.clientEmail && (
                            <SendRetainerReceiptButton paymentId={row.id} clientEmail={row.clientEmail} receiptNumber={row.receiptNumber ?? ""} />
                          )}
                          {!row.sentAt && row.type === "investor" && row.clientEmail && (
                            <SendInvestorReceiptButton entryId={row.id} investorEmail={row.clientEmail} receiptNumber={row.receiptNumber} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
