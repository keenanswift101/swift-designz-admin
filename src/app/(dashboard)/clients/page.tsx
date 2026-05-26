import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { Users, Briefcase, DollarSign, UserPlus, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Client } from "@/types/database";

export default async function ClientsPage() {
  const supabase = await createClient();

  const now = new Date();
  const mtdStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [clientsResult, invoicesResult, projectsResult] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("client_id, amount, paid_amount, status")
      .eq("doc_type", "invoice")
      .not("status", "in", '("draft","cancelled")'),
    supabase
      .from("projects")
      .select("client_id, status"),
  ]);

  const clients = (clientsResult.data ?? []) as Client[];
  const invoices = (invoicesResult.data ?? []) as {
    client_id: string; amount: number; paid_amount: number; status: string;
  }[];
  const projects = (projectsResult.data ?? []) as { client_id: string; status: string }[];

  // ── Per-client aggregates ──────────────────────────────────
  const billingMap = new Map<string, { billed: number; collected: number; outstanding: number }>();
  invoices.forEach(({ client_id, amount, paid_amount, status }) => {
    const entry = billingMap.get(client_id) ?? { billed: 0, collected: 0, outstanding: 0 };
    entry.billed += amount;
    entry.collected += paid_amount;
    if (["sent", "partial", "overdue"].includes(status)) entry.outstanding += amount - paid_amount;
    billingMap.set(client_id, entry);
  });

  const projectMap = new Map<string, { total: number; active: number }>();
  projects.forEach(({ client_id, status }) => {
    const entry = projectMap.get(client_id) ?? { total: 0, active: 0 };
    entry.total++;
    if (["planning", "in_progress", "review"].includes(status)) entry.active++;
    projectMap.set(client_id, entry);
  });

  // ── Page-level stats ───────────────────────────────────────
  const totalClients = clients.length;
  const newThisMonth = clients.filter((c) => c.created_at >= mtdStart).length;
  const withActiveProjects = clients.filter((c) => (projectMap.get(c.id)?.active ?? 0) > 0).length;
  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <PageHeader
        title="Clients"
        description="Your client directory"
        actions={
          <Link
            href="/clients/new"
            className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Client
          </Link>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Total Clients
            </p>
            <p className="text-5xl font-bold leading-none text-foreground">{totalClients}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-teal font-medium">{withActiveProjects} with active projects</span>
              {newThisMonth > 0 && (
                <>
                  <span>&mdash;</span>
                  <span className="text-green-400 font-medium">+{newThisMonth} this month</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Billed</p>
            <p className="text-4xl font-bold text-teal">{formatCurrency(totalBilled)}</p>
            <p className="text-xs text-gray-600 mt-1">across all clients</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <Users className="h-5 w-5 text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-foreground">{totalClients}</p>
          <p className="text-xs text-gray-500 mt-1">Total Clients</p>
        </div>
        <div className="glass-card p-5">
          <Briefcase className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{withActiveProjects}</p>
          <p className="text-xs text-gray-500 mt-1">Active Projects</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-teal">{formatCurrency(totalBilled)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Billed</p>
        </div>
        <div className="glass-card p-5">
          <UserPlus className="h-5 w-5 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-green-400">{newThisMonth}</p>
          <p className="text-xs text-gray-500 mt-1">New This Month</p>
        </div>
      </div>

      {/* Clients table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Billed</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Since</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">
                    No clients yet. Convert a lead or add one manually.
                  </td>
                </tr>
              ) : (
                clients.map((client, i) => {
                  const billing = billingMap.get(client.id);
                  const proj = projectMap.get(client.id);
                  const hasOutstanding = (billing?.outstanding ?? 0) > 0;
                  return (
                    <tr
                      key={client.id}
                      className={`border-b border-border/50 hover:bg-card transition-colors group ${
                        hasOutstanding ? "bg-amber-950/10" : i % 2 === 1 ? "bg-foreground/3" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                        >
                          {client.name}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {client.company ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {client.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {client.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {proj ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {proj.active > 0 && (
                              <span className="text-xs bg-teal/10 text-teal px-1.5 py-0.5 rounded font-medium">
                                {proj.active} active
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{proj.total}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-right text-foreground/60">
                        {billing ? formatCurrency(billing.billed) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasOutstanding ? (
                          <span className="text-sm font-mono font-medium text-amber-400">
                            {formatCurrency(billing!.outstanding)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
                        {formatDate(client.created_at)}
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
