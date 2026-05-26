import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import ReminderActions from "@/components/ar/ReminderActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Bell, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";

const STAGE_COLORS: Record<number, string> = {
  1: "text-teal border-teal/30 bg-teal/10",
  2: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  3: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  4: "text-red-400 border-red-400/30 bg-red-400/10",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-gray-500" />,
  approved: <CheckCircle2 className="h-3.5 w-3.5 text-teal" />,
  sent: <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />,
  dismissed: <XCircle className="h-3.5 w-3.5 text-gray-600" />,
};

type Reminder = {
  id: string;
  stage: number;
  stage_label: string;
  scheduled_for: string;
  status: string;
  email_subject: string | null;
  whatsapp_message: string | null;
  sent_at: string | null;
  invoices: {
    id: string;
    invoice_number: string;
    amount: number;
    paid_amount: number;
    due_date: string;
    clients: { name: string; email: string; company: string | null } | null;
  } | null;
};

function ReminderRow({ r }: { r: Reminder }) {
  const outstanding = r.invoices ? r.invoices.amount - r.invoices.paid_amount : 0;
  const isScheduledPast = new Date(r.scheduled_for) <= new Date();
  return (
    <tr className="hover:bg-card/50 transition-colors">
      <td className="px-5 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STAGE_COLORS[r.stage] ?? "text-gray-400 border-gray-700 bg-gray-700/10"}`}>
          {r.stage_label}
        </span>
      </td>
      <td className="px-4 py-3">
        {r.invoices ? (
          <>
            <Link href={`/invoices/${r.invoices.id}`} className="text-sm text-teal hover:underline font-mono">
              {r.invoices.invoice_number}
            </Link>
            <p className="text-xs text-gray-500 mt-0.5">{r.invoices.clients?.name ?? "—"}</p>
          </>
        ) : <span className="text-xs text-gray-600">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">{r.invoices?.clients?.email ?? "—"}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-amber-400 tabular-nums">
        {formatCurrency(outstanding)}
      </td>
      <td className="px-4 py-3 text-xs whitespace-nowrap">
        <span className={isScheduledPast && r.status === "pending" ? "text-red-400" : "text-gray-400"}>
          {formatDate(r.scheduled_for)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {STATUS_ICON[r.status]}
          <span className="text-xs text-gray-500 capitalize">{r.status}</span>
          {r.sent_at && <span className="text-xs text-gray-600">· {formatDate(r.sent_at)}</span>}
        </div>
      </td>
      <td className="px-5 py-3">
        <ReminderActions
          id={r.id}
          status={r.status}
          whatsappMessage={r.whatsapp_message}
          stage={r.stage}
        />
      </td>
    </tr>
  );
}

function ReminderTable({ rows: tableRows, emptyText }: { rows: Reminder[]; emptyText: string }) {
  if (tableRows.length === 0) {
    return <p className="px-6 py-8 text-sm text-center text-gray-500">{emptyText}</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client Email</th>
          <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-5 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {tableRows.map((r) => <ReminderRow key={r.id} r={r} />)}
      </tbody>
    </table>
  );
}

export default async function RemindersPage() {
  const supabase = await createClient();

  const { data: reminders } = await supabase
    .from("payment_reminders")
    .select(`
      id, stage, stage_label, scheduled_for, status, email_subject, whatsapp_message, sent_at,
      invoices(id, invoice_number, amount, paid_amount, due_date, clients(name, email, company))
    `)
    .order("scheduled_for", { ascending: true });

  const rows = (reminders ?? []) as unknown as Reminder[];

  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");
  const sent = rows.filter((r) => r.status === "sent");
  const dismissed = rows.filter((r) => r.status === "dismissed");

  const overdue = pending.filter((r) => new Date(r.scheduled_for) <= new Date());
  const upcoming = pending.filter((r) => new Date(r.scheduled_for) > new Date());

  return (
    <>
      <PageHeader
        title="Payment Reminders"
        description="Approval queue for invoice payment reminders"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-red-400">{overdue.length}</p>
          <p className="text-xs text-gray-500 mt-1">Overdue to Send</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-teal">{approved.length}</p>
          <p className="text-xs text-gray-500 mt-1">Approved</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-gray-400">{upcoming.length}</p>
          <p className="text-xs text-gray-500 mt-1">Upcoming</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-green-400">{sent.length}</p>
          <p className="text-xs text-gray-500 mt-1">Sent</p>
        </div>
      </div>

      {/* Overdue / Approved — needs action */}
      {(overdue.length > 0 || approved.length > 0) && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Needs Action</h2>
          </div>
          <ReminderTable rows={[...overdue, ...approved]} emptyText="Nothing needs action." />
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal" />
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming</h2>
          </div>
          <ReminderTable rows={upcoming} emptyText="No upcoming reminders." />
        </div>
      )}

      {/* Sent / Dismissed */}
      {(sent.length > 0 || dismissed.length > 0) && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">History</h2>
          </div>
          <ReminderTable rows={[...sent, ...dismissed]} emptyText="No history yet." />
        </div>
      )}

      {rows.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <Bell className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-400">No reminders scheduled</p>
          <p className="text-xs text-gray-600 mt-1">Reminders are auto-created when you send an invoice.</p>
        </div>
      )}
    </>
  );
}
