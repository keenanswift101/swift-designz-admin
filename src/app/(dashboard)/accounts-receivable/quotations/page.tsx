import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import type { QuotationWithJoins, QuotationStatus } from "@/types/accounts-receivable";

const STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  sent:      { label: "Sent",      color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  accepted:  { label: "Accepted",  color: "text-teal bg-teal/10 border-teal/20" },
  converted: { label: "Converted", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  expired:   { label: "Expired",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export default async function QuotationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role as UserRole;
  const isAdmin = role === "admin";

  const { data: rows } = await supabase
    .from("quotations")
    .select("*, clients(id, name, email, phone, company), projects(id, name)")
    .order("created_at", { ascending: false });

  const quotations = (rows ?? []) as QuotationWithJoins[];

  const counts = {
    total: quotations.length,
    draft: quotations.filter((q) => q.status === "draft").length,
    sent: quotations.filter((q) => q.status === "sent").length,
    accepted: quotations.filter((q) => q.status === "accepted").length,
    expired: quotations.filter((q) => q.status === "expired").length,
  };

  const totalValue = quotations.filter((q) => !["cancelled"].includes(q.status)).reduce((s, q) => s + q.total, 0);
  const acceptedValue = quotations.filter((q) => q.status === "accepted").reduce((s, q) => s + q.total, 0);

  return (
    <>
      <PageHeader
        title="Estimates & Quotations"
        description="Create and manage quotations for client approval"
        actions={isAdmin ? (
          <Link
            href="/accounts-receivable/quotations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal/10 text-teal border border-teal/25 hover:bg-teal/20 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New Quotation
          </Link>
        ) : undefined}

      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{counts.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Quotations</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-blue-400">{counts.sent}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting Response</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-teal">{formatCurrency(acceptedValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Accepted Value</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Pipeline Value</p>
        </div>
      </div>

      {/* Table */}
      {quotations.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <FileText className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-400">No quotations yet</p>
          <p className="text-xs text-gray-600 mt-1">Create your first quotation to get started</p>
          {isAdmin && (
            <Link
              href="/accounts-receivable/quotations/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal/10 text-teal border border-teal/25 hover:bg-teal/20 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              New Quotation
            </Link>
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Quote #</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Project</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => {
                  const cfg = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.draft;
                  return (
                    <tr key={q.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-gray-400">{q.quote_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{q.clients?.name ?? "—"}</p>
                        {q.clients?.company && (
                          <p className="text-xs text-gray-500">{q.clients.company}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{q.projects?.name ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm tabular-nums text-foreground font-medium">{formatCurrency(q.total)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{formatDate(q.created_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/accounts-receivable/quotations/${q.id}`}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-teal transition-colors flex items-center"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
