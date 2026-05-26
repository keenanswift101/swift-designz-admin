import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import IncomeForm from "@/components/accounting/IncomeForm";
import StatusBadge from "@/components/ui/StatusBadge";
import { updateIncomeAction } from "../../actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, ExternalLink, Receipt } from "lucide-react";
import type { IncomeEntry, Invoice, InvoiceItem, Payment } from "@/types/database";

type InvoiceWithJoins = Invoice & {
  clients: { id: string; name: string; email: string; phone: string | null; company: string | null } | null;
  projects: { id: string; name: string } | null;
};

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("income_entries").select("*").eq("id", id).single();
  if (!data) notFound();

  const entry = data as IncomeEntry;

  // If this income entry is linked to an invoice, fetch all invoice data
  let invoice: InvoiceWithJoins | null = null;
  let invoiceItems: InvoiceItem[] = [];
  let invoicePayments: Payment[] = [];

  if (entry.invoice_id) {
    const [{ data: inv }, { data: items }, { data: pays }] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, clients(id, name, email, phone, company), projects(id, name)")
        .eq("id", entry.invoice_id)
        .single(),
      supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", entry.invoice_id)
        .order("sort_order"),
      supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", entry.invoice_id)
        .order("paid_at", { ascending: false }),
    ]);
    invoice = (inv as InvoiceWithJoins) ?? null;
    invoiceItems = (items ?? []) as InvoiceItem[];
    invoicePayments = (pays ?? []) as Payment[];
  }

  async function action(formData: FormData) {
    "use server";
    return updateIncomeAction(id, formData);
  }

  const client = invoice?.clients ?? null;
  const isQuotation = invoice?.doc_type === "quotation";
  const docLabel = isQuotation ? "Quotation" : "Invoice";
  const discountAmt = invoice?.discount_amount ?? 0;
  const itemsSubtotal = invoiceItems.reduce((s, it) => s + it.amount, 0);
  const outstanding = invoice ? (invoice.amount - invoice.paid_amount) : 0;

  return (
    <>
      <PageHeader
        title="Edit Income"
        description={entry.description}
        backHref="/accounting/income"
        actions={
          entry.invoice_id ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/api/invoices/${entry.invoice_id}/pdf`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal border border-teal/40 hover:border-teal rounded-lg transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Print / PDF
              </Link>
              <Link
                href={`/invoices/${entry.invoice_id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border hover:border-teal rounded-lg transition-colors"
              >
                <Receipt className="h-3.5 w-3.5" />
                Full Invoice
              </Link>
            </div>
          ) : null
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Edit form — narrower column */}
        <div className={invoice ? "xl:col-span-2" : "max-w-2xl"}>
          <IncomeForm entry={entry} action={action} submitLabel="Save Changes" />
        </div>

        {/* Inline invoice preview */}
        {invoice && (
          <div className="xl:col-span-3 space-y-5">
            {/* Invoice header card */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-1">{docLabel}</p>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">{invoice.invoice_number}</h2>
                  {client && (
                    <p className="text-sm text-gray-400 mt-1">{client.company ? `${client.company} · ` : ""}{client.name}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={invoice.status} />
                  <p className="text-xs text-gray-500">Due {formatDate(invoice.due_date)}</p>
                </div>
              </div>

              {client && (
                <div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-4">
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider font-semibold mb-1">Client</p>
                    <p className="text-foreground font-medium">{client.name}</p>
                    {client.company && <p className="text-gray-400">{client.company}</p>}
                    <p className="text-gray-400">{client.email}</p>
                    {client.phone && <p className="text-gray-400">{client.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 uppercase tracking-wider font-semibold mb-1">Amount Due</p>
                    <p className="text-3xl font-bold text-teal font-mono">{formatCurrency(isQuotation ? invoice.amount : outstanding)}</p>
                    {!isQuotation && invoice.paid_amount > 0 && (
                      <p className="text-xs text-green-400 mt-1">{formatCurrency(invoice.paid_amount)} paid</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Line Items</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-center px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider w-14">Qty</th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rate</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoiceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-card/50">
                      <td className="px-5 py-3 text-sm text-foreground">{item.description}</td>
                      <td className="px-3 py-3 text-sm text-gray-400 text-center">{item.quantity}</td>
                      <td className="px-3 py-3 text-sm text-gray-400 text-right font-mono">{formatCurrency(item.unit_rate)}</td>
                      <td className="px-5 py-3 text-sm text-foreground text-right font-mono font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {discountAmt > 0 ? (
                    <>
                      <tr className="border-t border-border">
                        <td colSpan={3} className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</td>
                        <td className="px-5 py-2.5 text-right text-sm font-bold text-foreground font-mono">{formatCurrency(itemsSubtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-5 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</td>
                        <td className="px-5 py-2 text-right text-sm font-bold text-red-400 font-mono">-{formatCurrency(discountAmt)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr className="border-t border-border">
                      <td colSpan={3} className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</td>
                      <td className="px-5 py-2.5 text-right text-sm font-bold text-foreground font-mono">{formatCurrency(invoice.amount)}</td>
                    </tr>
                  )}
                  {!isQuotation && invoice.paid_amount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</td>
                      <td className="px-5 py-2 text-right text-sm font-bold text-green-400 font-mono">-{formatCurrency(invoice.paid_amount)}</td>
                    </tr>
                  )}
                  <tr className="border-t border-teal/30">
                    <td colSpan={3} className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {isQuotation ? "Total" : "Amount Due"}
                    </td>
                    <td className="px-5 py-3 text-right text-base font-bold text-teal font-mono">
                      {formatCurrency(isQuotation ? invoice.amount : outstanding)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment history — invoices only */}
            {!isQuotation && invoicePayments.length > 0 && (
              <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment History</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoicePayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-card/50">
                        <td className="px-5 py-3 text-sm text-foreground/60">{formatDate(pay.paid_at)}</td>
                        <td className="px-3 py-3 text-sm text-gray-400 capitalize">{pay.method}</td>
                        <td className="px-3 py-3 text-sm text-gray-500 font-mono">
                          {pay.reference || "—"}
                          {pay.proof_url && (
                            <a
                              href={pay.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center gap-0.5 text-teal hover:underline text-xs"
                            >
                              Proof <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-foreground text-right font-mono font-medium">{formatCurrency(pay.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="glass-card p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-foreground/60 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Print / PDF CTA */}
            <Link
              href={`/api/invoices/${entry.invoice_id}/pdf`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 bg-teal hover:bg-teal-hover text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Download className="h-4 w-4" />
              Download &amp; Print {docLabel} PDF
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

