import { createClient } from "@/lib/supabase/server";
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

type ReminderInvoice = {
  id: string; invoice_number: string; amount: number; paid_amount: number; due_date: string;
  payment_plan_enabled: boolean; payment_plan_schedule: { amount_cents?: number; amount?: number }[] | null;
  quotation_id: string | null; clients: { name: string; email: string; company: string | null } | null;
};
type Reminder = {
  id: string; stage: number; stage_label: string; scheduled_for: string; status: string;
  email_subject: string | null; whatsapp_message: string | null; sent_at: string | null;
  invoices: ReminderInvoice | null; outstanding: number;
};

function ReminderRow({ r }: { r: Reminder }) {
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
            <Link href={`/invoices/${r.invoices.id}`} className="text-sm text-teal hover:underline font-mono">{r.invoices.invoice_number}</Link>
            <p className="text-xs text-gray-500 mt-0.5">{r.invoices.clients?.name ?? "—"}</p>
          </>
        ) : <span className="text-xs text-gray-600">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">{r.invoices?.clients?.email ?? "—"}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-amber-400 tabular-nums">{formatCurrency(r.outstanding)}</td>
      <td className="px-4 py-3 text-xs whitespace-nowrap">
        <span className={isScheduledPast && r.status === "pending" ? "text-red-400" : "text-gray-400"}>{formatDate(r.scheduled_for)}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {STATUS_ICON[r.status]}
          <span className="text-xs text-gray-500 capitalize">{r.status}</span>
          {r.sent_at && <span className="text-xs text-gray-600">· {formatDate(r.sent_at)}</span>}
        </div>
      </td>
      <td className="px-5 py-3">
        <ReminderActions id={r.id} status={r.status} whatsappMessage={r.whatsapp_message} stage={r.stage} />
      </td>
    </tr>
  );
}

function ReminderTable({ rows, emptyText }: { rows: Reminder[]; emptyText: string }) {
  if (rows.length === 0) return <p className="px-6 py-8 text-sm text-center text-gray-500">{emptyText}</p>;
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
      <tbody className="divide-y divide-border">{rows.map((r) => <ReminderRow key={r.id} r={r} />)}</tbody>
    </table>
  );
}

export default async function RemindersTab() {
  const supabase = await createClient();

  const { data: reminders } = await supabase
    .from("payment_reminders")
    .select(`id, stage, stage_label, scheduled_for, status, email_subject, whatsapp_message, sent_at,
      invoices(id, invoice_number, amount, paid_amount, due_date, payment_plan_enabled, payment_plan_schedule, quotation_id, clients(name, email, company))`)
    .order("scheduled_for", { ascending: true });

  const rawRows = (reminders ?? []) as unknown as Omit<Reminder, "outstanding">[];

  const quotationIds = [...new Set(rawRows.map((r) => (r.invoices as ReminderInvoice | null)?.quotation_id).filter((id): id is string => !!id))];

  const planPaidByQuotation = new Map<string, number>();
  const planTotalByQuotation = new Map<string, number>();
  if (quotationIds.length > 0) {
    const { data: planInvoices } = await supabase.from("invoices").select("quotation_id, paid_amount, payment_plan_schedule").in("quotation_id", quotationIds);
    for (const inv of planInvoices ?? []) {
      const qid = inv.quotation_id as string;
      planPaidByQuotation.set(qid, (planPaidByQuotation.get(qid) ?? 0) + (inv.paid_amount as number));
      if (!planTotalByQuotation.has(qid)) {
        type S = { amount_cents?: number; amount?: number };
        const sched = (inv.payment_plan_schedule as S[] | null) ?? [];
        planTotalByQuotation.set(qid, sched.reduce((s, it) => s + (it.amount_cents ?? it.amount ?? 0), 0));
      }
    }
  }

  function computeOutstanding(inv: ReminderInvoice | null): number {
    if (!inv) return 0;
    if (inv.quotation_id && inv.payment_plan_enabled) {
      const pp = planPaidByQuotation.get(inv.quotation_id) ?? 0;
      const pt = planTotalByQuotation.get(inv.quotation_id) ?? 0;
      if (pt > 0) return Math.max(0, pt - pp);
    }
    return inv.amount - inv.paid_amount;
  }

  const rows: Reminder[] = rawRows.map((r) => ({
    ...r, invoices: r.invoices as ReminderInvoice | null,
    outstanding: computeOutstanding(r.invoices as ReminderInvoice | null),
  }));

  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");
  const sent = rows.filter((r) => r.status === "sent");
  const dismissed = rows.filter((r) => r.status === "dismissed");
  const overdue = pending.filter((r) => new Date(r.scheduled_for) <= new Date());
  const upcoming = pending.filter((r) => new Date(r.scheduled_for) > new Date());

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5"><p className="text-2xl font-bold text-red-400">{overdue.length}</p><p className="text-xs text-gray-500 mt-1">Overdue to Send</p></div>
        <div className="glass-card p-5"><p className="text-2xl font-bold text-teal">{approved.length}</p><p className="text-xs text-gray-500 mt-1">Approved</p></div>
        <div className="glass-card p-5"><p className="text-2xl font-bold text-gray-400">{upcoming.length}</p><p className="text-xs text-gray-500 mt-1">Upcoming</p></div>
        <div className="glass-card p-5"><p className="text-2xl font-bold text-green-400">{sent.length}</p><p className="text-xs text-gray-500 mt-1">Sent</p></div>
      </div>

      {(overdue.length > 0 || approved.length > 0) && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Needs Action</h2>
          </div>
          <ReminderTable rows={[...overdue, ...approved]} emptyText="Nothing needs action." />
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal" />
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming</h2>
          </div>
          <ReminderTable rows={upcoming} emptyText="No upcoming reminders." />
        </div>
      )}
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
