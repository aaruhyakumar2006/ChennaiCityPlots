import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { VisitStatus } from "@/types";

const ACTIONS: Record<VisitStatus, [string, VisitStatus][]> = {
  PENDING: [["Approve", "APPROVED"], ["Cancel", "CANCELLED"]],
  APPROVED: [["Mark Completed", "COMPLETED"], ["Cancel", "CANCELLED"]],
  COMPLETED: [],
  CANCELLED: [["Reopen", "PENDING"]],
};

export default function VisitActions({
  id,
  status,
  onUpdate,
}: {
  id: string;
  status: VisitStatus;
  onUpdate: (id: string, newStatus: VisitStatus) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function update(newStatus: VisitStatus) {
    setSaving(true);
    const { error } = await (supabase.from("site_visits") as ReturnType<typeof supabase.from>).update({ status: newStatus } as never).eq("id", id);
    if (!error) onUpdate(id, newStatus);
    setSaving(false);
  }

  const actions = ACTIONS[status] ?? [];
  if (actions.length === 0) return <span className="text-xs text-muted">—</span>;

  return (
    <div className="flex justify-end gap-2">
      {actions.map(([label, newStatus]) => (
        <button
          key={newStatus}
          disabled={saving}
          onClick={() => update(newStatus)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-line hover:border-accent hover:text-accent transition disabled:opacity-60"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
