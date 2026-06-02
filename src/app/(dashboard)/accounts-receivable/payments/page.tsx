import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";
import SendReceiptButton from "@/components/invoices/SendReceiptButton";
import SendRetainerReceiptButton from "@/components/ar/SendRetainerReceiptButton";

type UnifiedRow =
  | {
      type: "invoice";
      id: string;
      date: string;
      clientName: string;
      clientEmail: string;
      clientCompany: string | null;
      reference: string | null;
      method: string;
      amount: number;
      receiptNumber: string | null;
      sentAt: string | null;
      invoiceId: string;
      invoiceNumber: string;
      invoiceTotal: number;
      invoicePaidTotal: number;
    }
  | {
      type: "retainer";
      id: string;
      date: string;
      clientName: string;
      clientEmail: string;
      clientCompany: string | null;
      reference: string | null;
      method: string;
      amount: number;
      receiptNumber: string | null;
      sentAt: string | null;
      retainerName: string;
    };

export default async function PaymentsPage() {
  const supabase = await createClient();

  const [
    { data: payments },
    { data: confirmations },
    { data: retainerPayments },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select(`
        id, amount, method, reference, paid_at,
        invoices(id, invoice_number, amount, paid_amount, clients(name, email, company))
      `)
      .order("paid_at", { ascending: false }),
    supabase
      .from("payment_confirmations")
      .select("payment_id, receipt_number, sent_at"),
    supabase
      .from("retainer_payments")
      .select(`
        id, amount, payment_method, payment_date, reference, receipt_number, sent_at,
        retainer_subscriptions(name, clients(name, email, company))
      `)
      .order("payment_date", { ascending: false }),
  ]);

  const sentMap = new Map(
    (confirmations ?? []).map((c) => [
      c.payment_id,
      { receiptNumber: c.receipt_number, sentAt: c.sent_at as string | null },
    ])
  );

  // Normalise invoice payments
  const invoiceRows: UnifiedRow[] = ((payments ?? []) as unknown as {
    id: string; amount: number; method: string; reference: string | null; paid_at: string;
    invoices: { id: string; invoice_number: string; amount: number; paid_amount: number; clients: { name: string; email: string; company: string | null } | null } | null;
  }[]).map((p) => {
    const conf = sentMap.get(p.id);
    const client = p.invoices?.clients;
    return {
      type: "invoice",
      id: p.id,
      date: p.paid_at,
      clientName: client?.name ?? "—",
      clientEmail: client?.email ?? "",
      clientCompany: client?.company ?? null,
      reference: p.reference,
      method: p.method,
      amount: p.amount,
      receiptNumber: conf?.receiptNumber ?? null,
      sentAt: conf?.sentAt ?? null,
      invoiceId: p.invoices?.id ?? "",
      invoiceNumber: p.invoices?.invoice_number ?? "—",
      invoiceTotal: p.invoices?.amount ?? 0,
      invoicePaidTotal: p.invoices?.paid_amount ?? 0,
    };
  });

  // Normalise retainer payments
  const retainerRows: UnifiedRow[] = ((retainerPayments ?? []) as unknown as {
    id: string; amount: number; payment_method: string; payment_date: string;
    reference: string | null; receipt_number: string | null; sent_at: string | null;
    retainer_subscriptions: { name: string; clients: { name: string; email: string; company: string | null } | null } | null;
  }[]).map((p) => {
    const sub = p.retainer_subscriptions;
    const client = sub?.clients;
    return {
      type: "retainer",
      id: p.id,
      date: p.payment_date,
      clientName: client?.name ?? "—",
      clientEmail: client?.email ?? "",
      clientCompany: client?.company ?? null,
      reference: p.reference,
      method: p.payment_method,
      amount: p.amount,
      receiptNumber: p.receipt_number,
      sentAt: p.sent_at,
      retainerName: sub?.name ?? "Retainer",
    };
  });

  // Merge and sort by date descending
  const allRows: UnifiedRow[] = [...invoiceRows, ...retainerRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // KPIs
  const totalAmount = allRows.reduce((s, r) => s + r.amount, 0);
  const invoiceCount = invoiceRows.length;
  const retainerCount = retainerRows.length;
  const receiptsSent = allRows.filter((r) => r.sentAt).length;

  return (
    <>
      <PageHeader
        title="Payments"
        description="All recorded payments and receipt confirmations"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <p className="text-lg font-bold text-teal tabular-nums">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Received</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{invoiceCount}</p>
          <p className="text-xs text-gray-500 mt-1">Invoice Payments</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{retainerCount}</p>
          <p className="text-xs text-gray-500 mt-1">Retainer Payments</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{receiptsSent}<span className="text-sm text-gray-500 font-normal"> / {allRows.length}</span></p>
          <p className="text-xs text-gray-500 mt-1">Receipts Sent</p>
        </div>
      </div>

      {allRows.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <CheckCircle2 className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-400">No payments recorded yet</p>
          <p className="text-xs text-gray-600 mt-1">Payments appear here once recorded on an invoice or retainer.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allRows.map((row) => (
                <tr key={`${row.type}-${row.id}`} className="hover:bg-card/50 transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(row.date)}</td>

                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground leading-tight">{row.clientName}</p>
                    {row.clientCompany && <p className="text-xs text-gray-500">{row.clientCompany}</p>}
                  </td>

                  <td className="px-4 py-3">
                    {row.type === "invoice" ? (
                      row.invoiceId ? (
                        <Link href={`/invoices/${row.invoiceId}`} className="text-xs text-teal hover:underline font-mono">
                          {row.invoiceNumber}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3 text-teal shrink-0" />
                        <span className="text-xs text-teal font-medium">{row.retainerName}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-400 capitalize">{row.method}</td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground tabular-nums">
                    {formatCurrency(row.amount)}
                  </td>

                  <td className="px-4 py-3">
                    {row.receiptNumber ? (
                      row.type === "invoice" ? (
                        <a
                          href={`/api/docs/receipts/${row.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          {row.sentAt
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0" />
                            : <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          }
                          <span className={`text-xs font-mono underline underline-offset-2 ${row.sentAt ? "text-teal" : "text-amber-400"}`}>
                            {row.receiptNumber}
                          </span>
                        </a>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          {row.sentAt
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0" />
                            : <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          }
                          <span className={`text-xs font-mono ${row.sentAt ? "text-teal" : "text-amber-400"}`}>
                            {row.receiptNumber}
                          </span>
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
                      <SendReceiptButton
                        paymentId={row.id}
                        previewData={{
                          clientName: row.clientName,
                          clientEmail: row.clientEmail,
                          clientCompany: row.clientCompany,
                          invoiceNumber: row.invoiceNumber,
                          paymentAmount: row.amount,
                          paymentMethod: row.method,
                          paymentReference: row.reference,
                          paymentDate: row.date,
                          invoiceTotal: row.invoiceTotal,
                          invoicePaidTotal: row.invoicePaidTotal,
                        }}
                      />
                    )}
                    {!row.sentAt && row.type === "retainer" && row.clientEmail && (
                      <SendRetainerReceiptButton
                        paymentId={row.id}
                        clientEmail={row.clientEmail}
                        receiptNumber={row.receiptNumber ?? ""}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
