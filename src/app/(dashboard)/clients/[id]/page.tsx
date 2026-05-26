import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteClientButton from "@/components/clients/DeleteClientButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, ExternalLink, FolderOpen, FileText, User } from "lucide-react";
import SendDocumentButton from "@/components/documents/SendDocumentButton";
import { getClientGenerationTemplates } from "@/lib/document-templates";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: clientRaw },
    { data: projects },
    { data: invoices },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*, linked_lead:leads!lead_id(id, name, source, status, created_at)")
      .eq("id", id)
      .single(),
    supabase
      .from("projects")
      .select("id, name, service, status, quoted_amount, due_date")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, paid_amount, status, due_date")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!clientRaw) notFound();

  const client = clientRaw as typeof clientRaw & {
    linked_lead: { id: string; name: string; source: string; status: string; created_at: string } | null;
  };
  const linkedLead = client.linked_lead ?? null;

  // Invoice financials
  const totalBilled = (invoices || []).reduce((s, inv) => s + inv.amount, 0);
  const totalPaid = (invoices || []).reduce((s, inv) => s + inv.paid_amount, 0);
  const outstanding = totalBilled - totalPaid;

  const DOC_TEMPLATES = getClientGenerationTemplates();

  return (
    <>
      <PageHeader
        title={client.name}
        description={client.company || client.email}
        backHref="/clients"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Generate Document dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal border border-teal/40 hover:border-teal rounded-lg transition-colors">
                <FileText className="h-3.5 w-3.5" />
                Generate Doc
              </button>
              <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-xl z-20 hidden group-hover:block">
                {DOC_TEMPLATES.map((t) => (
                  <div
                    key={t.slug}
                    className="flex items-center justify-between px-3 py-2 hover:bg-border first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    <Link
                      href={`/api/docs/${id}/${t.slug}`}
                      target="_blank"
                      className="flex-1 text-sm text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {t.label}
                    </Link>
                    <SendDocumentButton
                      clientId={id}
                      clientEmail={client.email}
                      template={t.slug}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Link
              href={`/clients/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border hover:border-teal rounded-lg transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
            <DeleteClientButton id={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Client Details */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500 mb-1">Email</dt>
                <dd className="text-sm text-foreground">
                  <a href={`mailto:${client.email}`} className="hover:text-teal transition-colors">{client.email}</a>
                </dd>
              </div>
              {client.phone && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Phone</dt>
                  <dd className="text-sm text-foreground">{client.phone}</dd>
                </div>
              )}
              {client.company && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Company</dt>
                  <dd className="text-sm text-foreground">{client.company}</dd>
                </div>
              )}
              {client.location && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Location</dt>
                  <dd className="text-sm text-foreground">{client.location}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 mb-1">Client Since</dt>
                <dd className="text-sm text-foreground">{formatDate(client.created_at)}</dd>
              </div>
            </dl>
            {client.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <dt className="text-xs text-gray-500 mb-1">Notes</dt>
                <dd className="text-sm text-foreground/60 whitespace-pre-wrap">{client.notes}</dd>
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5 text-teal" />
                Projects
              </h2>
              <Link href={`/projects/new?client_id=${id}`}
                className="text-xs text-teal hover:underline">
                + New Project
              </Link>
            </div>
            {(!projects || projects.length === 0) ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">No projects yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quoted</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-card transition-colors">
                      <td className="px-6 py-3">
                        <Link href={`/projects/${p.id}`} className="text-sm font-medium text-foreground hover:text-teal flex items-center gap-1">
                          {p.name} <ExternalLink className="h-3 w-3 opacity-50" />
                        </Link>
                        {p.service && <p className="text-xs text-gray-500 mt-0.5">{p.service}</p>}
                      </td>
                      <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-3 text-sm text-foreground/60">
                        {p.quoted_amount ? formatCurrency(p.quoted_amount) : "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {p.due_date ? formatDate(p.due_date) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Invoices */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-teal" />
                Invoices
              </h2>
              <Link href={`/invoices?client_id=${id}`} className="text-xs text-teal hover:underline">
                View all
              </Link>
            </div>
            {(!invoices || invoices.length === 0) ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">No invoices yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-card transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-foreground">{inv.invoice_number}</td>
                      <td className="px-6 py-3 text-sm text-foreground/60">{formatCurrency(inv.amount)}</td>
                      <td className="px-6 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-3 text-sm text-gray-500">{formatDate(inv.due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Financial Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-gray-500">Total Billed</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(totalBilled)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-gray-500">Total Paid</span>
                <span className="text-sm font-semibold text-green-400">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-500">Outstanding</span>
                <span className={`text-sm font-semibold ${outstanding > 0 ? "text-amber-400" : "text-gray-400"}`}>
                  {formatCurrency(outstanding)}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Lead */}
          {linkedLead && (
            <div className="glass-card p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-teal" />
                Converted From Lead
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Lead</span>
                  <Link href={`/leads/${linkedLead.id}`} className="text-sm text-teal hover:underline flex items-center gap-1">
                    {linkedLead.name} <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Source</span>
                  <span className="text-sm text-foreground/60">{linkedLead.source.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Converted</span>
                  <span className="text-sm text-foreground/60">{formatDate(linkedLead.created_at)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
