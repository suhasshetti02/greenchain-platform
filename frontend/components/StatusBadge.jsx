import { cn } from "@/lib/utils";

const statusStyles = {
  operational: {
    label: "Operational",
    style: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  available: {
    label: "Available",
    style: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  delayed: {
    label: "Delayed",
    style: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  in_transit: {
    label: "In Transit",
    style: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  claimed: {
    label: "Claimed",
    style: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  offline: {
    label: "Offline",
    style: "bg-rose-100 text-rose-700 ring-rose-200",
  },
  completed: {
    label: "Completed",
    style: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  expired: {
    label: "Expired",
    style: "bg-rose-100 text-rose-700 ring-rose-200",
  },
  critical: {
    label: "High Priority",
    style: "bg-rose-100 text-rose-700 ring-rose-200",
  },
};

/**
 * Semantic badge for system status pills.
 */
export default function StatusBadge({ status = "operational", className }) {
  const { label, style } = statusStyles[status] ?? statusStyles.operational;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        style,
        className,
      )}
    >
      <span className="size-2 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

