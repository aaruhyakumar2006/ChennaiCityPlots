import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import ExportLeadsCsvButton from "@/components/admin/ExportLeadsCsvButton";
import LeadDetailDrawer from "@/components/admin/LeadDetailDrawer";
import { formatDateShort } from "@/lib/format";
import { Search } from "lucide-react";
import type { LeadWithProperty, LeadStatus } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  NEW:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONTACTED:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  NEGOTIATION: "bg-orange-50 text-orange-700 border-orange-200",
  CONVERTED:   "bg-green-50 text-green-700 border-green-200",
  LOST:        "bg-gray-100 text-gray-500 border-gray-200",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadWithProperty | null>(null);
  const [filter, setFilter] = useState<LeadStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("leads")
      .select("*, properties(name, property_id)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLeads((data as LeadWithProperty[]) ?? []);
        setLoading(false);
      });
  }, []);

  // Realtime — new leads appear instantly, status updates sync across tabs
  useEffect(() => {
    const channel = supabase
      .channel("admin-leads-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        setLeads((prev) => [payload.new as LeadWithProperty, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads" }, (payload) => {
        setLeads((prev) =>
          prev.map((l) => (l.id === (payload.new as LeadWithProperty).id ? { ...l, ...(payload.new as LeadWithProperty) } : l))
        );
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function handleStatusUpdate(id: string, newStatus: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    if (selectedLead?.id === id) setSelectedLead((prev) => prev ? { ...prev, status: newStatus } : prev);
  }

  function handleLeadUpdate(updated: LeadWithProperty) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  }

  const byStatus  = filter === "ALL" ? leads : leads.filter((l) => l.status === filter);
  const filtered  = search.trim()
    ? byStatus.filter((l) => {
        const q = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.mobile.includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.properties?.name?.toLowerCase().includes(q)
        );
      })
    : byStatus;
  const newCount = leads.filter((l) => l.status === "NEW").length;
  const convertedCount = leads.filter((l) => l.status === "CONVERTED").length;

  return (
    <>
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Leads",  value: leads.length,    color: "text-ink" },
          { label: "New",          value: newCount,        color: "text-emerald-600" },
          { label: "Converted",    value: convertedCount,  color: "text-green-600" },
          { label: "Conversion %", value: leads.length > 0 ? `${Math.round((convertedCount / leads.length) * 100)}%` : "0%", color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-line px-5 py-4">
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-wrap gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(["ALL", "NEW", "CONTACTED", "NEGOTIATION", "CONVERTED", "LOST"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === s
                    ? "bg-accent text-white"
                    : "bg-surface text-muted hover:text-ink"
                }`}
              >
                {s === "ALL" ? `All (${leads.length})` : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, mobile, email…"
                className="pl-8 pr-3 py-1.5 rounded-lg border border-line text-xs focus:border-accent focus:outline-none w-52"
              />
            </div>
              <ExportLeadsCsvButton
            leads={leads.map((l) => ({
              id: l.id,
              name: l.name,
              mobile: l.mobile,
              email: l.email,
              status: l.status,
              notes: l.notes,
              followUpAt: l.follow_up_at,
              property: l.properties,
            }))}
          />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted animate-pulse">Loading leads…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Message</th>
                  <th className="px-5 py-3 font-semibold">Received</th>
                  <th className="px-5 py-3 font-semibold">Follow-up</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className="border-t border-line hover:bg-surface/60 cursor-pointer"
                    onClick={() => setSelectedLead(l)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{l.name}</p>
                      <a href={`tel:${l.mobile}`} className="text-xs text-accent hover:underline">{l.mobile}</a>
                      <p className="text-xs text-muted truncate max-w-[140px]">{l.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-muted">{l.properties?.name ?? <span className="italic">General enquiry</span>}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted max-w-[180px] truncate">{l.message ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDateShort(l.created_at)}</td>
                    <td className="px-5 py-3.5">
                      {l.follow_up_at ? (
                        <span className="text-accent font-medium whitespace-nowrap">{formatDateShort(l.follow_up_at)}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <LeadStatusSelect id={l.id} status={l.status} onUpdate={handleStatusUpdate} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">No leads found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
}
