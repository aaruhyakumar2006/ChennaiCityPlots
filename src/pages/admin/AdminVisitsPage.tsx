import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VisitActions from "@/components/admin/VisitActions";
import { formatDateShort } from "@/lib/format";
import { Search } from "lucide-react";
import type { SiteVisitWithProperty, VisitStatus } from "@/types";

const TABS: VisitStatus[] = ["PENDING", "APPROVED", "COMPLETED", "CANCELLED"];

export default function AdminVisitsPage() {
  const [activeTab, setActiveTab] = useState<VisitStatus>("PENDING");
  const [visits, setVisits] = useState<SiteVisitWithProperty[]>([]);
  const [counts, setCounts] = useState<Record<VisitStatus, number>>({
    PENDING: 0, APPROVED: 0, COMPLETED: 0, CANCELLED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [visitsRes, ...countResults] = await Promise.all([
        supabase
          .from("site_visits")
          .select("*, properties(name)")
          .eq("status", activeTab)
          .order("date", { ascending: true }),
        ...TABS.map((t) =>
          supabase.from("site_visits").select("id", { count: "exact", head: true }).eq("status", t)
        ),
      ]);
      setVisits((visitsRes.data as SiteVisitWithProperty[]) ?? []);
      const newCounts = {} as Record<VisitStatus, number>;
      TABS.forEach((t, i) => { newCounts[t] = countResults[i].count ?? 0; });
      setCounts(newCounts);
      setLoading(false);
    }
    load();
  }, [activeTab]);

  function handleUpdate(id: string, newStatus: VisitStatus) {
    // Remove from current tab view, update counts
    setVisits((prev) => prev.filter((v) => v.id !== id));
    setCounts((prev) => ({
      ...prev,
      [activeTab]: Math.max(0, prev[activeTab] - 1),
      [newStatus]: prev[newStatus] + 1,
    }));
  }

  return (
    <div className="bg-white rounded-xl2 border border-line overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-wrap gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                activeTab === t ? "bg-accent text-white" : "bg-surface text-ink-700"
              }`}
            >
              {t[0] + t.slice(1).toLowerCase()} ({counts[t]})
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or mobile…"
            className="pl-8 pr-3 py-1.5 rounded-lg border border-line text-xs focus:border-accent focus:outline-none w-44"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-muted animate-pulse">Loading visits…</div>
        ) : (() => {
          const filtered = search.trim()
            ? visits.filter((v) => {
                const q = search.toLowerCase();
                return (
                  v.name.toLowerCase().includes(q) ||
                  (v.mobile ?? "").includes(q) ||
                  v.properties?.name?.toLowerCase().includes(q)
                );
              })
            : visits;
          return (
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Mobile</th>
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-t border-line hover:bg-surface/60">
                    <td className="px-5 py-3.5 font-medium">{v.name}</td>
                    <td className="px-5 py-3.5 text-muted">
                      {v.mobile ? (
                        <a href={`tel:${v.mobile}`} className="hover:text-accent transition">{v.mobile}</a>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{v.properties?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted">{formatDateShort(v.date)}</td>
                    <td className="px-5 py-3.5 text-muted">{v.time_slot}</td>
                    <td className="px-5 py-3.5">
                      <VisitActions id={v.id} status={v.status} onUpdate={handleUpdate} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted">
                      {search.trim() ? "No visits match your search" : `No ${activeTab.toLowerCase()} visits`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          );
        })()}
      </div>
    </div>
  );
}
