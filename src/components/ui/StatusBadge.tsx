import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const VARIANT_MAP: Record<string, string> = {
  new: "badge-new",
  contacted: "badge-contacted",
  quoted: "badge-quoted",
  won: "badge-won",
  lost: "badge-lost",
  active: "badge-active",
  draft: "badge-draft",
  sent: "badge-sent",
  paid: "badge-paid",
  partial: "badge-partial",
  overdue: "badge-overdue",
  planning: "badge-sent",
  in_progress: "badge-contacted",
  review: "badge-quoted",
  completed: "badge-won",
  on_hold: "badge-contacted",
  cancelled: "badge-lost",
  prospective: "badge-sent",
  exited: "badge-lost",
  inactive: "badge-draft",
  terminated: "badge-lost",
  paused: "badge-contacted",
  retired: "badge-draft",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = VARIANT_MAP[status] || "badge-draft";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        variant,
        className
      )}
    >
      {label}
    </span>
  );
}
