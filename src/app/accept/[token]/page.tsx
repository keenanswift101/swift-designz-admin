import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import AcceptForm from "./AcceptForm";

function fmtR(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_rate: number;
  amount: number;
  sort_order: number;
}

interface PaymentPlanInstallment {
  label: string;
  amount_cents: number;
  due_date: string;
  installment_number: number;
}

interface Quotation {
  id: string;
  quote_number: string;
  status: string;
  total: number;
  subtotal: number;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  notes: string | null;
  terms: string | null;
  expires_at: string | null;
  accepted_at: string | null;
  accepted_by_name: string | null;
  payment_plan_enabled: boolean;
  payment_plan_type: string | null;
  payment_plan_schedule: PaymentPlanInstallment[] | null;
  clients: { name: string; company: string | null } | null;
}

export default async function AcceptQuotationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quote, error } = await supabase
    .from("quotations")
    .select("id, quote_number, status, total, subtotal, discount_type, discount_value, discount_amount, notes, terms, expires_at, accepted_at, accepted_by_name, payment_plan_enabled, payment_plan_type, payment_plan_schedule, clients(name, company)")
    .eq("acceptance_token", token)
    .single();

  if (error || !quote) notFound();

  const q = quote as unknown as Quotation;

  const { data: items } = await supabase
    .from("quotation_line_items")
    .select("id, description, quantity, unit_rate, amount, sort_order")
    .eq("quotation_id", q.id)
    .order("sort_order");

  const lineItems = (items ?? []) as LineItem[];

  const isExpired = q.status === "expired" || (q.expires_at && new Date(q.expires_at) < new Date());
  const isAccepted = q.status === "accepted";
  const isCancelled = q.status === "cancelled";
  const canAccept = q.status === "sent" && !isExpired;

  const clientName = q.clients?.name ?? "";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      {/* Brand header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Swift Designz" width={36} height={36} className="shrink-0" />
          <div>
            <p className="text-base font-bold text-teal tracking-tight leading-tight">Swift Designz</p>
            <p className="text-xs text-gray-500">swiftdesignz.co.za</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0c2020] to-[#081818] px-8 py-6 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal/70 mb-1">
            Quotation for Approval
          </p>
          <h1 className="text-2xl font-bold text-foreground">{q.quote_number}</h1>
          {q.clients && (
            <p className="text-sm text-gray-400 mt-1">
              Prepared for{" "}
              <span className="text-foreground font-medium">
                {q.clients.company ? `${q.clients.name} (${q.clients.company})` : q.clients.name}
              </span>
            </p>
          )}
          {q.expires_at && !isAccepted && !isCancelled && (
            <p className="text-xs text-gray-500 mt-2">
              {isExpired ? "Expired" : "Expires"} {fmtDate(q.expires_at)}
            </p>
          )}
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Status banners */}
          {isAccepted && (
            <div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-4 text-center">
              <p className="text-sm font-semibold text-teal">This quotation has been accepted</p>
              {q.accepted_by_name && (
                <p className="text-xs text-gray-400 mt-1">Accepted by {q.accepted_by_name}</p>
              )}
              {q.accepted_at && (
                <p className="text-xs text-gray-500 mt-0.5">{fmtDate(q.accepted_at)}</p>
              )}
            </div>
          )}

          {isExpired && !isAccepted && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-4 text-center">
              <p className="text-sm font-semibold text-red-400">This quotation has expired</p>
              <p className="text-xs text-gray-400 mt-1">Please contact Swift Designz to request a new quotation.</p>
            </div>
          )}

          {isCancelled && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-4 text-center">
              <p className="text-sm font-semibold text-orange-400">This quotation has been cancelled</p>
              <p className="text-xs text-gray-400 mt-1">Please contact Swift Designz for more information.</p>
            </div>
          )}

          {/* Line items */}
          {lineItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Line Items</p>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sidebar border-b border-border">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Qty</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Rate</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={item.id} className={i < lineItems.length - 1 ? "border-b border-border" : ""}>
                        <td className="px-4 py-3 text-foreground">{item.description}</td>
                        <td className="px-4 py-3 text-gray-400 text-center tabular-nums">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-400 text-right tabular-nums">{fmtR(item.unit_rate)}</td>
                        <td className="px-4 py-3 text-foreground font-medium text-right tabular-nums">{fmtR(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="bg-sidebar border-t border-border px-4 py-3 space-y-1.5">
                  {q.discount_amount > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-400 tabular-nums">{fmtR(q.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Discount
                          {q.discount_type === "percentage" ? ` (${q.discount_value}%)` : ""}
                        </span>
                        <span className="text-red-400 tabular-nums">-{fmtR(q.discount_amount)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-border">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-teal tabular-nums">{fmtR(q.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Plan Schedule */}
          {q.payment_plan_enabled && q.payment_plan_schedule && q.payment_plan_schedule.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Payment Schedule</p>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sidebar border-b border-border">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.payment_plan_schedule.map((inst, i) => (
                      <tr key={inst.installment_number} className={i < q.payment_plan_schedule!.length - 1 ? "border-b border-border" : ""}>
                        <td className="px-4 py-3 text-gray-500 text-xs tabular-nums">{inst.installment_number}</td>
                        <td className="px-4 py-3 text-foreground">{inst.label}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{fmtDate(inst.due_date)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-teal tabular-nums">{fmtR(inst.amount_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-sidebar border-t border-border px-4 py-2.5">
                  <p className="text-xs text-gray-500">
                    Total:{" "}
                    <span className="text-teal font-semibold tabular-nums">{fmtR(q.total)}</span>
                    {" "}· Installment 1 will be invoiced first. Subsequent invoices follow the schedule above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {q.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Notes</p>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{q.notes}</p>
            </div>
          )}

          {/* Terms */}
          {q.terms && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Terms &amp; Conditions</p>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{q.terms}</p>
            </div>
          )}

          {/* Acceptance form */}
          {canAccept && <AcceptForm token={token} clientName={clientName} />}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border">
          <p className="text-xs text-gray-600">
            Swift Designz &middot; swiftdesignz.co.za &middot; keenan@swiftdesignz.co.za
          </p>
        </div>
      </div>
    </div>
  );
}
