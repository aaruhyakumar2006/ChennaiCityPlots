import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { LeadStatus } from "@/types";

const STAGES: LeadStatus[] = ["NEW", "CONTACTED", "NEGOTIATION", "CONVERTED", "LOST"];

export default function LeadStatusSelect({
  id,
  status,
  onUpdate,
}: {
  id: string;
  status: LeadStatus;
  onUpdate?: (id: string, newStatus: LeadStatus) => void;
}) {
  const [current, setCurrent] = useState<LeadStatus>(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(value: LeadStatus) {
    setSaving(true);
    const { error } = await (supabase.from("leads") as ReturnType<typeof supabase.from>).update({ status: value } as never).eq("id", id);
    if (!error) {
      setCurrent(value);
      onUpdate?.(id, value);
    }
    setSaving(false);
  }

  return (
    <select
      value={current}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as LeadStatus)}
      className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-line bg-white disabled:opacity-60"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s[0] + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}
