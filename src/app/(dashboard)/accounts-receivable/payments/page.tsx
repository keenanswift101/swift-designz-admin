import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock } from "lucide-react";
import SendReceiptButton from "@/components/invoices/SendReceiptButton";

export default async function PaymentsPage() {
  const supabase = await createClient();

  const [{ data: payments }, { data: confirmations }] = await Promise.all([
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
  ]);

  const sentMap = new Map(
    (confirmations ?? []).map((c) => [c.payment_id, { receiptNumber: c.receipt_number, sentAt: c.sent_at }])
  );

  const rows = (payments ?? []) as unknown as {
    id: string;
    amount: number;
    method: string;
    reference: string | null;
    paid_at: string;
    invoices: { id: string; invoice_number: string; amount: number; paid_amount: number; clients: { name: string; email: string; company: string | null } | null } | null;
  }[];

  return (
    <>
      <PageHeader
        title="Payments"
        description="All recorded payments and receipt confirmations"
      />

      {rows.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <CheckCircle2 className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-400">No payments recorded yet</p>
          <p className="text-xs text-gray-600 mt-1">Payments will appear here once recorded on an invoice.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((pay) => {
                const receipt = sentMap.get(pay.id);
                const client = pay.invoices?.clients;
                return (
                  <tr key={pay.id} className="hover:bg-card/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(pay.paid_at)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground leading-tight">{client?.name ?? "—"}</p>
                      {client?.company && <p className="text-xs text-gray-500">{client.company}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {pay.invoices ? (
                        <Link
                          href={`/invoices/${pay.invoices.id}`}
                          className="text-xs text-teal hover:underline font-mono"
                        >
                          {pay.invoices.invoice_number}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 capitalize">{pay.method}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {receipt ? (
                        <a
                          href={`/api/docs/receipts/${pay.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0" />
                          <span className="text-xs text-teal font-mono underline underline-offset-2">{receipt.receiptNumber}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                          <span className="text-xs text-gray-600">Not sent</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {!receipt && (
                        <SendReceiptButton
                          paymentId={pay.id}
                          previewData={pay.invoices ? {
                            clientName: pay.invoices.clients?.name ?? "",
                            clientEmail: pay.invoices.clients?.email ?? "",
                            clientCompany: pay.invoices.clients?.company ?? null,
                            invoiceNumber: pay.invoices.invoice_number,
                            paymentAmount: pay.amount,
                            paymentMethod: pay.method,
                            paymentReference: pay.reference,
                            paymentDate: pay.paid_at,
                            invoiceTotal: pay.invoices.amount,
                            invoicePaidTotal: pay.invoices.paid_amount,
                          } : undefined}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
