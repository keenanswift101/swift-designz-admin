import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import NewRetainerForm from "@/components/ar/NewRetainerForm";
import RetainerStatusButton from "@/components/ar/RetainerStatusButton";

type RetainerSub = {
  id: string;
  name: string;
  monthly_amount: number;
  billing_day: number;
  status: "active" | "paused" | "cancelled";
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  clients: { name: string; company: string | null } | null;
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-teal border-teal/30 bg-teal/10",
  paused: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  cancelled: "text-gray-500 border-gray-700 bg-gray-700/10",
};

function billingDayLabel(day: number): string {
  if (day === 31) return "Last day";
  if (day >= 28) return `${day}th (or last)`;
  if (day === 1) return "1st";
  return `${day}th`;
}

export default async function RetainersPage() {
  const supabase = await createClient();

  const [{ data: retainers }, { data: clients }] = await Promise.all([
    supabase
      .from("retainer_subscriptions")
      .select("id, name, monthly_amount, billing_day, status, start_date, end_date, notes, created_at, clients(name, company)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name, company").order("name"),
  ]);

  const rows = (retainers ?? []) as unknown as RetainerSub[];
  const active = rows.filter((r) => r.status === "active");
  const paused = rows.filter((r) => r.status === "paused");
  const cancelled = rows.filter((r) => r.status === "cancelled");

  const monthlyRevenue = active.reduce((s, r) => s + r.monthly_amount, 0);

  return (
    <>
      <PageHeader
        title="Retainer Subscriptions"
        description="Active retainer clients with monthly billing"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-teal">{active.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-amber-400">{paused.length}</p>
          <p className="text-xs text-gray-500 mt-1">Paused</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-gray-400">{cancelled.length}</p>
          <p className="text-xs text-gray-500 mt-1">Cancelled</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-lg font-bold text-foreground">{formatCurrency(monthlyRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Monthly Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2">
          {rows.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center text-center">
              <RefreshCw className="h-10 w-10 text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-400">No retainer subscriptions yet</p>
              <p className="text-xs text-gray-600 mt-1">Add your first retainer client using the form.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Retainer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Billing</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm text-foreground font-medium leading-tight">{r.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Started {formatDate(r.start_date)}
                          {r.end_date ? ` · ends ${formatDate(r.end_date)}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground leading-tight">{r.clients?.name ?? "—"}</p>
                        {r.clients?.company && <p className="text-xs text-gray-500">{r.clients.company}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {billingDayLabel(r.billing_day)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-foreground tabular-nums">
                        {formatCurrency(r.monthly_amount)}
                        <span className="text-xs text-gray-500 font-normal">/mo</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <RetainerStatusButton id={r.id} status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New retainer form */}
        <div>
          <NewRetainerForm clients={clients ?? []} />
        </div>
      </div>
    </>
  );
}
