import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import type { QuotationWithJoins, QuotationLineItem, QuotationStatus } from "@/types/accounts-receivable";
import QuotationActions from "@/components/ar/QuotationActions";

const STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  sent:      { label: "Sent",      color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  accepted:  { label: "Accepted",  color: "text-teal bg-teal/10 border-teal/20" },
  converted: { label: "Converted", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  expired:   { label: "Expired",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuotationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = (profile?.role as UserRole) === "admin";

  const [{ data: q }, { data: itemRows }] = await Promise.all([
    supabase.from("quotations")
      .select("*, clients(id, name, email, phone, company), projects(id, name)")
      .eq("id", id)
      .single(),
    supabase.from("quotation_line_items")
      .select("*")
      .eq("quotation_id", id)
      .order("sort_order"),
  ]);

  if (!q) redirect("/accounts-receivable/quotations");

  const quote = q as QuotationWithJoins;
  const items = (itemRows ?? []) as QuotationLineItem[];
  const cfg = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.draft;
  const canEdit = isAdmin && !quote.locked;
  const canSend = isAdmin && quote.status === "draft";
  const canCancel = isAdmin && ["draft", "sent"].includes(quote.status);

  return (
    <>
      <PageHeader
        title={quote.quote_number}
        description={`${quote.clients?.name ?? "Unknown client"}${quote.projects?.name ? ` · ${quote.projects.name}` : ""}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/accounts-receivable/quotations"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
              {cfg.label}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {canEdit && (
                <Link
                  href={`/accounts-receivable/quotations/${id}/edit`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 border border-border hover:bg-white/10 transition-colors text-xs font-medium"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              )}
              {canSend && <QuotationActions id={id} action="send" />}
              {canCancel && <QuotationActions id={id} action="cancel" />}
            </div>
          </div>

          {/* Line items */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Line Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-2.5 text-xs text-gray-500 font-medium">Description</th>
                  <th className="text-center px-3 py-2.5 text-xs text-gray-500 font-medium">Qty</th>
                  <th className="text-right px-3 py-2.5 text-xs text-gray-500 font-medium">Unit Rate</th>
                  <th className="text-right px-5 py-2.5 text-xs text-gray-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border/30">
                    <td className="px-5 py-3 text-foreground">{item.description}</td>
                    <td className="px-3 py-3 text-center text-gray-400 tabular-nums">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-gray-400 tabular-nums">{formatCurrency(item.unit_rate)}</td>
                    <td className="px-5 py-3 text-right text-foreground tabular-nums font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 space-y-2 border-t border-border bg-white/2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Discount ({quote.discount_type === "percentage" ? `${quote.discount_value}%` : "fixed"})</span>
                  <span className="tabular-nums text-amber-400">-{formatCurrency(quote.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span className="tabular-nums text-teal">{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          {quote.terms && (
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Terms & Conditions</h2>
              <p className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">{quote.terms}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Client details */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Client</h3>
            <dl className="space-y-2">
              <div>
                <dd className="text-sm font-medium text-foreground">{quote.clients?.name ?? "—"}</dd>
                {quote.clients?.company && (
                  <dd className="text-xs text-gray-500">{quote.clients.company}</dd>
                )}
              </div>
              {quote.clients?.email && (
                <div>
                  <dt className="text-xs text-gray-600">Email</dt>
                  <dd className="text-xs text-gray-400">{quote.clients.email}</dd>
                </div>
              )}
              {quote.clients?.phone && (
                <div>
                  <dt className="text-xs text-gray-600">Phone</dt>
                  <dd className="text-xs text-gray-400">{quote.clients.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quotation details */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h3>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Status</dt>
                <dd>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Created</dt>
                <dd className="text-xs text-gray-400">{formatDate(quote.created_at)}</dd>
              </div>
              {quote.sent_at && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Sent</dt>
                  <dd className="text-xs text-gray-400">{formatDate(quote.sent_at)}</dd>
                </div>
              )}
              {quote.expires_at && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Expires</dt>
                  <dd className="text-xs text-gray-400">{formatDate(quote.expires_at)}</dd>
                </div>
              )}
              {quote.accepted_at && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Accepted</dt>
                  <dd className="text-xs text-teal">{formatDate(quote.accepted_at)}</dd>
                </div>
              )}
              {quote.accepted_by_name && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Signed by</dt>
                  <dd className="text-xs text-gray-400">{quote.accepted_by_name}</dd>
                </div>
              )}
              {quote.payment_plan_enabled && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Payment plan</dt>
                  <dd className="text-xs text-gray-400">{quote.payment_plan_type ?? "Enabled"}</dd>
                </div>
              )}
              {quote.projects && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Project</dt>
                  <dd className="text-xs text-gray-400">{quote.projects.name}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{quote.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
