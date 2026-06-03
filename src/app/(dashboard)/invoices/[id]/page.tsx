import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteInvoiceButton from "@/components/invoices/DeleteInvoiceButton";
import PaymentForm from "@/components/invoices/PaymentForm";
import SendInvoiceButton from "@/components/invoices/SendInvoiceButton";
import SendReceiptButton from "@/components/invoices/SendReceiptButton";
import CreditNoteForm from "@/components/invoices/CreditNoteForm";
import VoidCreditNoteButton from "@/components/invoices/VoidCreditNoteButton";
import { deletePaymentAction } from "@/app/(dashboard)/invoices/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, Download, ExternalLink, Trash2 } from "lucide-react";
import type { Payment } from "@/types/database";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: invoice },
    { data: items },
    { data: payments },
    { data: creditNotes },
    { data: confirmations },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, clients(id, name, email, phone, company), projects(id, name), profiles(full_name)")
      .eq("id", id)
      .single(),
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("sort_order"),
    supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", id)
      .order("paid_at", { ascending: false }),
    supabase
      .from("credit_notes")
      .select("id, credit_note_number, type, reason, amount, status, issued_at")
      .eq("invoice_id", id)
      .order("issued_at", { ascending: false }),
    supabase
      .from("payment_confirmations")
      .select("payment_id")
      .eq("invoice_id", id),
  ]);
  const receiptSentSet = new Set((confirmations ?? []).map((c) => c.payment_id));

  // Fetch linked quotation if this invoice was converted from one
  let linkedQuotation: { id: string; quote_number: string } | null = null;
  if (invoice?.quotation_id) {
    const { data: q } = await supabase
      .from("quotations")
      .select("id, quote_number")
      .eq("id", invoice.quotation_id)
      .single();
    linkedQuotation = q ?? null;
  }

  if (!invoice) notFound();

  const client = invoice.clients as { id: string; name: string; email: string; phone: string | null; company: string | null } | null;
  const project = invoice.projects as { id: string; name: string } | null;
  const creator = invoice.profiles as { full_name: string } | null;
  const outstanding = invoice.amount - invoice.paid_amount;
  const itemsSubtotal = (items || []).reduce((s: number, it: { amount: number }) => s + it.amount, 0);
  const discountAmt = (invoice.discount_amount ?? 0) as number;
  const isQuotation = invoice.doc_type === "quotation";
  const docLabel = isQuotation ? "Quotation" : "Invoice";

  return (
    <>
      <PageHeader
        title={invoice.invoice_number}
        description={`${client?.name || docLabel} · ${docLabel}`}
        backHref="/invoices"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {!isQuotation && <SendInvoiceButton invoiceId={id} />}
            <Link
              href={`/api/invoices/${id}/pdf`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border hover:border-teal rounded-lg transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Link>
            <Link
              href={`/invoices/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border hover:border-teal rounded-lg transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
            <DeleteInvoiceButton id={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Line Items */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Line Items</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Qty</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rate</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(items || []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 text-sm text-foreground">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-right font-mono">{formatCurrency(item.unit_rate)}</td>
                    <td className="px-6 py-3 text-sm text-foreground text-right font-mono font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {discountAmt > 0 ? (
                  <>
                    <tr className="border-t border-border">
                      <td colSpan={3} className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-foreground font-mono">{formatCurrency(itemsSubtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</td>
                      <td className="px-6 py-2 text-right text-sm font-bold text-red-400 font-mono">-{formatCurrency(discountAmt)}</td>
                    </tr>
                  </>
                ) : (
                  <tr className="border-t border-border">
                    <td colSpan={3} className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-foreground font-mono">{formatCurrency(itemsSubtotal)}</td>
                  </tr>
                )}
                {!isQuotation && invoice.paid_amount > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</td>
                    <td className="px-6 py-2 text-right text-sm font-bold text-green-400 font-mono">-{formatCurrency(invoice.paid_amount)}</td>
                  </tr>
                )}
                <tr className="border-t border-teal/30">
                  <td colSpan={3} className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">{isQuotation ? "Total" : "Amount Due"}</td>
                  <td className="px-6 py-3 text-right text-base font-bold text-teal font-mono">{formatCurrency(isQuotation ? invoice.amount : outstanding)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment History — invoices only */}
          {!isQuotation && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment History</h2>
              </div>
              {(!payments || payments.length === 0) ? (
                <p className="px-6 py-8 text-sm text-center text-gray-500">No payments recorded yet.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(payments as Payment[]).map((pay) => (
                      <tr key={pay.id} className="hover:bg-card">
                        <td className="px-6 py-3 text-sm text-foreground/60">{formatDate(pay.paid_at)}</td>
                        <td className="px-4 py-3 text-sm text-gray-400 capitalize">{pay.method}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">
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
                        <td className="px-4 py-3 text-sm text-foreground text-right font-mono font-medium">{formatCurrency(pay.amount)}</td>
                        <td className="px-2 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {!receiptSentSet.has(pay.id) && <SendReceiptButton paymentId={pay.id} />}
                            <form action={async () => {
                              "use server";
                              await deletePaymentAction(pay.id, id);
                            }}>
                              <button
                                type="submit"
                                className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors"
                                title="Delete payment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Credit Notes — invoices only */}
          {!isQuotation && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Notes</h2>
                <CreditNoteForm invoiceId={id} />
              </div>
              {(!creditNotes || creditNotes.length === 0) ? (
                <p className="px-6 py-8 text-sm text-center text-gray-500">No credit notes issued.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(creditNotes as { id: string; credit_note_number: string; type: string; reason: string; amount: number; status: string; issued_at: string | null }[]).map((cn) => (
                      <tr key={cn.id} className="hover:bg-card">
                        <td className="px-6 py-3 text-xs font-mono text-teal">{cn.credit_note_number}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 capitalize">{cn.type}</td>
                        <td className="px-4 py-3 text-sm text-foreground/70 max-w-xs truncate">{cn.reason}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-medium text-red-400">-{formatCurrency(cn.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            cn.status === "voided" ? "bg-red-500/10 text-red-400" :
                            cn.status === "issued" ? "bg-teal/10 text-teal" :
                            "bg-green-500/10 text-green-400"
                          }`}>
                            {cn.status}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {cn.status !== "voided" && <VoidCreditNoteButton id={cn.id} invoiceId={id} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="glass-card p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h2>
              <p className="text-sm text-foreground/60 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Details */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Status</dt>
                <dd><StatusBadge status={invoice.status} /></dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Client</dt>
                <dd>
                  {client ? (
                    <Link href={`/clients/${client.id}`} className="text-sm text-teal hover:underline">
                      {client.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </dd>
              </div>
              {project && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Project</dt>
                  <dd>
                    <Link href={`/projects/${project.id}`} className="text-sm text-teal hover:underline">
                      {project.name}
                    </Link>
                  </dd>
                </div>
              )}
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">{isQuotation ? "Valid Until" : "Due Date"}</dt>
                <dd className="text-sm text-foreground/60">{formatDate(invoice.due_date)}</dd>
              </div>
              {!isQuotation && invoice.paid_date && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Paid Date</dt>
                  <dd className="text-sm text-green-400">{formatDate(invoice.paid_date)}</dd>
                </div>
              )}
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Created</dt>
                <dd className="text-xs text-gray-400">{formatDate(invoice.created_at)}</dd>
              </div>
              {creator && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Created by</dt>
                  <dd>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal border border-teal/20">
                      {creator.full_name}
                    </span>
                  </dd>
                </div>
              )}
              {linkedQuotation && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">From quotation</dt>
                  <dd>
                    <Link
                      href={`/accounts-receivable/quotations/${linkedQuotation.id}`}
                      className="text-xs text-teal hover:underline"
                    >
                      {linkedQuotation.quote_number}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Financial */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(invoice.amount)}</span>
              </div>
              {!isQuotation && (
                <>
                  <div className="flex justify-between items-center py-1.5 border-b border-border">
                    <span className="text-xs text-gray-500">Paid</span>
                    <span className="text-sm font-semibold text-green-400">{formatCurrency(invoice.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-gray-500">Outstanding</span>
                    <span className={`text-sm font-semibold ${outstanding > 0 ? "text-amber-400" : "text-gray-400"}`}>
                      {formatCurrency(outstanding)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Plan */}
          {invoice.payment_plan_enabled && (
            <div className="glass-card p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Payment Plan</h2>
              {invoice.payment_plan_type && (
                <p className="text-sm text-foreground font-medium mb-3 capitalize">
                  {invoice.payment_plan_type.replace(/_/g, " ").replace(/\b2\b/, "2-").replace(/\b3\b/, "3-")}
                </p>
              )}
              {invoice.payment_plan_schedule && Array.isArray(invoice.payment_plan_schedule) && (invoice.payment_plan_schedule as { label: string; amount_cents?: number; amount?: number }[]).length > 0 ? (
                <div className="space-y-2">
                  {(invoice.payment_plan_schedule as { label: string; amount_cents?: number; amount?: number; installment_number?: number; due_date?: string }[]).map((row, i) => {
                    const cents = row.amount_cents ?? row.amount ?? 0;
                    const isCurrent = row.installment_number === invoice.installment_number;
                    return (
                    <div key={i} className={`flex justify-between items-center py-1.5 border-b border-border last:border-0 ${isCurrent ? "rounded px-1.5 bg-teal/5" : ""}`}>
                      <span className="text-xs text-gray-400">
                        {row.label}
                        {isCurrent && <span className="ml-1.5 text-[10px] text-teal font-medium">← this invoice</span>}
                      </span>
                      <span className={`text-sm font-semibold font-mono ${isCurrent ? "text-teal" : "text-foreground"}`}>{formatCurrency(cents)}</span>
                    </div>
                    );
                  })}
                </div>
              ) : invoice.installment_count && invoice.installment_interval ? (
                <dl className="space-y-2">
                  <div className="flex justify-between items-center">
                    <dt className="text-xs text-gray-500">Installments</dt>
                    <dd className="text-sm text-foreground">{invoice.installment_count}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-xs text-gray-500">Interval</dt>
                    <dd className="text-sm text-foreground capitalize">{invoice.installment_interval}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-xs text-gray-500">Per Installment</dt>
                    <dd className="text-sm font-semibold text-teal">{formatCurrency(Math.ceil((isQuotation ? invoice.amount : outstanding) / invoice.installment_count))}</dd>
                  </div>
                </dl>
              ) : null}
            </div>
          )}

          {/* Record Payment — invoices only */}
          {!isQuotation && outstanding > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Record Payment</h2>
              <PaymentForm invoiceId={id} outstandingCents={outstanding} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
