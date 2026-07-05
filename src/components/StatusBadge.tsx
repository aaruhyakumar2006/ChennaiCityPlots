import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

const COLOR_MAP: Record<string, string> = {
  READY_TO_MOVE: "bg-ok/10 text-ok",
  UNDER_CONSTRUCTION: "bg-amber-100 text-amber-700",
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-accent-50 text-accent",
  COMPLETED: "bg-ok/10 text-ok",
  CANCELLED: "bg-red-50 text-red-600",
  NEW: "bg-accent-50 text-accent",
  CONTACTED: "bg-amber-100 text-amber-700",
  NEGOTIATION: "bg-purple-100 text-purple-700",
  CONVERTED: "bg-ok/10 text-ok",
  LOST: "bg-red-50 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  READY_TO_MOVE: "Available",
  UNDER_CONSTRUCTION: "Upcoming",
  PENDING: "Pending",
  APPROVED: "Approved",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NEW: "New",
  CONTACTED: "Contacted",
  NEGOTIATION: "Negotiation",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
        COLOR_MAP[status] ?? "bg-surface text-ink-700"
      )}
    >
      {STATUS_LABELS[status] ?? statusLabel(status)}
    </span>
  );
}
