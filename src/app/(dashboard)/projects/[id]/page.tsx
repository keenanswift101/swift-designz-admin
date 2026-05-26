import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import MilestoneBoard from "@/components/projects/MilestoneBoard";
import ProgressEditor from "@/components/projects/ProgressEditor";
import DeleteProjectButton from "@/components/projects/DeleteProjectButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, User, Calendar, Clock, DollarSign } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: milestones }, { data: invoices }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, clients(id, name, email)")
      .eq("id", id)
      .single(),
    supabase
      .from("project_milestones")
      .select("*")
      .eq("project_id", id)
      .order("sort_order"),
    supabase
      .from("invoices")
      .select("amount, paid_amount, status")
      .eq("project_id", id),
  ]);

  if (!project) notFound();

  const client = project.clients as { id: string; name: string; email: string } | null;

  // Calculate progress
  const total = milestones?.length ?? 0;
  const done = milestones?.filter((m) => m.completed).length ?? 0;
  const milestoneProgress = total > 0 ? Math.round((done / total) * 100) : 0;
  const progress = project.progress_override ?? milestoneProgress;
  const isOverridden = project.progress_override !== null && project.progress_override !== undefined;

  // Days remaining
  let daysRemaining: number | null = null;
  let daysColor = "text-gray-400";
  if (project.due_date) {
    const due = new Date(project.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    daysRemaining = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) daysColor = "text-red-400";
    else if (daysRemaining <= 7) daysColor = "text-amber-400";
    else daysColor = "text-green-400";
  }

  // Invoice summary
  const totalBilled = (invoices || []).reduce((s, inv) => s + inv.amount, 0);
  const totalPaid = (invoices || []).reduce((s, inv) => s + inv.paid_amount, 0);

  return (
    <>
      <PageHeader
        title={project.name}
        description={client?.name || "No client assigned"}
        backHref="/projects"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border hover:border-teal rounded-lg transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
            <DeleteProjectButton id={id} />
          </div>
        }
      />

      {/* Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Client</span>
          </div>
          {client ? (
            <Link href={`/clients/${client.id}`} className="text-sm font-semibold text-foreground hover:text-teal transition-colors">
              {client.name}
            </Link>
          ) : (
            <span className="text-sm text-gray-500">—</span>
          )}
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Quoted</span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {project.quoted_amount ? formatCurrency(project.quoted_amount) : "—"}
          </span>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Dates</span>
          </div>
          <span className="text-xs text-foreground/60">
            {project.start_date ? formatDate(project.start_date) : "—"}
            {" → "}
            {project.due_date ? formatDate(project.due_date) : "—"}
          </span>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Deadline</span>
          </div>
          {daysRemaining !== null ? (
            <span className={`text-sm font-semibold ${daysColor}`}>
              {daysRemaining < 0
                ? `${Math.abs(daysRemaining)}d overdue`
                : daysRemaining === 0
                ? "Due today"
                : `${daysRemaining}d left`}
            </span>
          ) : (
            <span className="text-sm text-gray-500">No due date</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main — Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Milestones</h2>
            <MilestoneBoard projectId={id} initialMilestones={milestones || []} />
          </div>

          {/* Notes */}
          {project.notes && (
            <div className="glass-card p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h2>
              <p className="text-sm text-foreground/60 whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status + Details */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Status</dt>
                <dd><StatusBadge status={project.status} /></dd>
              </div>
              {project.service && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Service</dt>
                  <dd className="text-sm text-foreground/60">{project.service}</dd>
                </div>
              )}
              {project.package && (
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-gray-500">Package</dt>
                  <dd className="text-sm text-foreground/60">{project.package}</dd>
                </div>
              )}
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Progress</dt>
                <dd>
                  <ProgressEditor
                    projectId={id}
                    progress={progress}
                    isOverridden={isOverridden}
                    milestoneProgress={milestoneProgress}
                  />
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-xs text-gray-500">Created</dt>
                <dd className="text-xs text-gray-400">{formatDate(project.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Invoice Summary */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Billing</h2>
            <div className="space-y-3">
              {project.quoted_amount != null && (
                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-xs text-gray-500">Quoted</span>
                  <span className="text-sm font-semibold text-teal">{formatCurrency(project.quoted_amount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-xs text-gray-500">Total Billed</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(totalBilled)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-xs text-gray-500">Total Paid</span>
                <span className="text-sm font-semibold text-green-400">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-gray-500">Outstanding</span>
                {(() => {
                  const base = project.quoted_amount ?? totalBilled;
                  const outstanding = base - totalPaid;
                  return (
                    <span className={`text-sm font-semibold ${outstanding > 0 ? "text-amber-400" : "text-gray-400"}`}>
                      {formatCurrency(Math.max(0, outstanding))}
                    </span>
                  );
                })()}
              </div>
              {(invoices || []).length === 0 && (
                <p className="text-[11px] text-gray-500 pt-1">No invoices linked to this project. Edit your invoices and select this project to track billing here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
