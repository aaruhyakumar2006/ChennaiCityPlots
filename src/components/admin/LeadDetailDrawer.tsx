import { useEffect, useRef, useState } from "react";
import { X, Save, Loader2, Phone, Mail, Building2, CalendarDays, MessageSquare, StickyNote } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import { formatDateShort } from "@/lib/format";
import type { LeadWithProperty, LeadStatus } from "@/types";

const STATUS_COLOR: Record<LeadStatus, string> = {
  NEW: "bg-emerald-50 text-emerald-700",
  CONTACTED: "bg-yellow-50 text-yellow-700",
  NEGOTIATION: "bg-orange-50 text-orange-700",
  CONVERTED: "bg-green-50 text-green-700",
  LOST: "bg-red-50 text-red-500",
};

interface Props {
  lead: LeadWithProperty;
  onClose: () => void;
  onUpdate: (updated: LeadWithProperty) => void;
  onStatusUpdate: (id: string, status: LeadStatus) => void;
}

export default function LeadDetailDrawer({ lead, onClose, onUpdate, onStatusUpdate }: Props) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [followUp, setFollowUp] = useState(
    lead.follow_up_at ? lead.follow_up_at.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync if parent changes lead
  useEffect(() => {
    setNotes(lead.notes ?? "");
    setFollowUp(lead.follow_up_at ? lead.follow_up_at.slice(0, 10) : "");
  }, [lead.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function save() {
    setSaving(true);
    const updates = {
      notes: notes.trim() || null,
      follow_up_at: followUp || null,
    };
    const { data, error } = await (supabase
      .from("leads") as ReturnType<typeof supabase.from>)
      .update(updates as never)
      .eq("id", lead.id)
      .select("*, properties(name, property_id)")
      .single();
    if (!error && data) {
      onUpdate(data as LeadWithProperty);
    }
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative bg-white w-full max-w-md flex flex-col shadow-2xl animate-slideInRight"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display font-bold text-base">Lead Detail</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Customer info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Customer</p>
            <p className="font-display font-semibold text-lg mb-1">{lead.name}</p>
            <div className="space-y-1.5 text-sm text-muted">
              <a
                href={`tel:${lead.mobile}`}
                className="flex items-center gap-2 hover:text-accent transition"
              >
                <Phone className="w-4 h-4" /> {lead.mobile}
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 hover:text-accent transition"
              >
                <Mail className="w-4 h-4" /> {lead.email}
              </a>
            </div>
          </div>

          {/* Property & date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Property
              </p>
              <p className="text-sm font-medium">{lead.properties?.name ?? "General enquiry"}</p>
              {lead.properties?.property_id && (
                <p className="text-xs text-muted">{lead.properties.property_id}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted mb-1 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Received
              </p>
              <p className="text-sm font-medium">{formatDateShort(lead.created_at)}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Status</p>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[lead.status]}`}>
                {lead.status}
              </span>
              <LeadStatusSelect
                id={lead.id}
                status={lead.status}
                onUpdate={onStatusUpdate}
              />
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </p>
              <p className="text-sm text-muted bg-surface rounded-xl2 px-4 py-3 leading-relaxed">
                {lead.message}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Internal Notes
            </p>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none min-h-[80px] resize-y bg-white"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this lead…"
            />
          </div>

          {/* Follow-up date */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Follow-up Date
            </p>
            <input
              type="date"
              className="w-full px-3.5 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none bg-white"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl2 border border-line text-sm font-semibold hover:border-accent transition"
          >
            Close
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}
