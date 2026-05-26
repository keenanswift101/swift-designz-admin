import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Briefcase, CheckCircle2, Clock, DollarSign, ArrowUpRight, AlertTriangle } from "lucide-react";
import type { Project, ProjectMilestone } from "@/types/database";

type ProjectWithClient = Project & { clients: { name: string } | null };

const statusOrder = ["planning", "in_progress", "review", "on_hold", "completed", "cancelled"] as const;
const statusConfig: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  planning:    { label: "Planning",    color: "text-blue-400",   bg: "bg-blue-400/10",   bar: "bg-blue-400" },
  in_progress: { label: "In Progress", color: "text-amber-400",  bg: "bg-amber-400/10",  bar: "bg-amber-400" },
  review:      { label: "Review",      color: "text-purple-400", bg: "bg-purple-400/10", bar: "bg-purple-400" },
  completed:   { label: "Completed",   color: "text-teal",       bg: "bg-teal/10",       bar: "bg-teal" },
  on_hold:     { label: "On Hold",     color: "text-gray-500",   bg: "bg-gray-500/10",   bar: "bg-gray-500" },
  cancelled:   { label: "Cancelled",   color: "text-gray-600",   bg: "bg-gray-600/10",   bar: "bg-gray-600" },
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const [projectsResult, milestonesResult] = await Promise.all([
    supabase.from("projects").select("*, clients(name)").order("created_at", { ascending: false }),
    supabase.from("project_milestones").select("project_id, completed"),
  ]);

  const projects = (projectsResult.data ?? []) as ProjectWithClient[];
  const milestones = (milestonesResult.data ?? []) as Pick<ProjectMilestone, "project_id" | "completed">[];

  // ── Per-project milestone progress ─────────────────────────
  const milestoneMap = new Map<string, { total: number; done: number }>();
  milestones.forEach(({ project_id, completed }) => {
    const entry = milestoneMap.get(project_id) ?? { total: 0, done: 0 };
    entry.total++;
    if (completed) entry.done++;
    milestoneMap.set(project_id, entry);
  });

  // ── Page-level stats ───────────────────────────────────────
  const total = projects.length;
  const active = projects.filter((p) => ["planning", "in_progress", "review"].includes(p.status)).length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const pipelineValue = projects
    .filter((p) => !["completed", "cancelled"].includes(p.status))
    .reduce((s, p) => s + (p.quoted_amount ?? 0), 0);

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Projects"
        description="Track all active and completed projects"
        actions={
          <Link
            href="/projects/new"
            className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            New Project
          </Link>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Active Projects
            </p>
            <p className="text-5xl font-bold leading-none text-foreground">{active}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-gray-400 font-medium">{total} total</span>
              <span>&mdash;</span>
              <span className="text-teal font-medium">{completed} completed</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pipeline Value</p>
            <p className="text-4xl font-bold text-teal">{formatCurrency(pipelineValue)}</p>
            <p className="text-xs text-gray-600 mt-1">active & on hold</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <Briefcase className="h-5 w-5 text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Projects</p>
        </div>
        <div className="glass-card p-5">
          <Clock className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{active}</p>
          <p className="text-xs text-gray-500 mt-1">In Progress</p>
        </div>
        <div className="glass-card p-5">
          <CheckCircle2 className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-teal">{completed}</p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-green-400">{formatCurrency(pipelineValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Pipeline Value</p>
        </div>
      </div>

      {/* Status breakdown */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {statusOrder
            .filter((s) => (statusCounts[s] ?? 0) > 0)
            .map((s) => {
              const cfg = statusConfig[s];
              return (
                <span
                  key={s}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-transparent ${cfg.bg} ${cfg.color}`}
                >
                  {statusCounts[s]} {cfg.label}
                </span>
              );
            })}
        </div>
      )}

      {/* Projects table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Progress</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quoted</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                    No projects yet.
                  </td>
                </tr>
              ) : (
                projects.map((project, i) => {
                  const ms = milestoneMap.get(project.id);
                  const progressPct =
                    project.progress_override !== null
                      ? project.progress_override
                      : ms && ms.total > 0
                        ? Math.round((ms.done / ms.total) * 100)
                        : null;

                  const isOverdue =
                    project.due_date &&
                    project.due_date < today &&
                    !["completed", "cancelled"].includes(project.status);

                  const isCompleted = project.status === "completed";
                  const isCancelled = project.status === "cancelled";
                  const isOnHold = project.status === "on_hold";

                  return (
                    <tr
                      key={project.id}
                      className={`border-b border-border/50 hover:bg-card transition-colors group ${
                        isOverdue
                          ? "bg-red-500/8"
                          : isCompleted
                            ? "bg-teal/5"
                            : isCancelled || isOnHold
                              ? "opacity-60"
                              : i % 2 === 1
                                ? "bg-foreground/3"
                                : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                        >
                          {isOverdue && (
                            <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
                          )}
                          {project.name}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {project.clients?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {project.service ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3">
                        {progressPct !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${progressPct === 100 ? "bg-teal" : "bg-teal/50"}`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 shrink-0 w-7 text-right">
                              {progressPct}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-foreground/60 text-right whitespace-nowrap">
                        {project.quoted_amount ? formatCurrency(project.quoted_amount) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        {project.due_date ? (
                          <span className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-gray-500"}`}>
                            {formatDate(project.due_date)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">—</span>
                        )}
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
