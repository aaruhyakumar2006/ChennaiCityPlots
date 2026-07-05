import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { groqChat } from "@/lib/groq";
import {
  Home as HomeIcon, CheckCircle2, BadgeCheck, Users, CalendarDays,
  Eye, ArrowRight, Sparkles, Loader2, RefreshCw, TrendingUp, Star,
} from "lucide-react";
import { formatDateShort } from "@/lib/format";
import type { LeadRow } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  total: number; ready: number; leadCount: number; visitCount: number;
  viewsToday: number; reviewCount: number; convertedLeads: number;
}

interface LeadForAI {
  name: string; status: string; property: string | null; created_at: string; message: string | null;
}

// ── Groq AI system prompt ─────────────────────────────────────────────────────
const AI_SYSTEM = `You are an expert real estate business analyst for Chennai City Plots, a Chennai plot broker.
Analyse the provided data and give a concise, actionable business intelligence report.
Format your response with these exact sections (use emoji headers):
📊 Overview (2 sentences max)
🔥 Hot Insights (3 bullet points of key findings)
⚡ Action Items (3 specific things the admin should do today)
📈 Trend (1 sentence about lead/property trend)
Keep it sharp, specific, and practical. Use Indian real estate context.`;

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,       setStats]       = useState<Stats>({ total: 0, ready: 0, leadCount: 0, visitCount: 0, viewsToday: 0, reviewCount: 0, convertedLeads: 0 });
  const [leads,       setLeads]       = useState<Pick<LeadRow, "created_at">[]>([]);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [loading,     setLoading]     = useState(true);

  // Groq AI state
  const [aiInsight,   setAiInsight]   = useState("");
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiError,     setAiError]     = useState("");
  const [leadsForAI,  setLeadsForAI]  = useState<LeadForAI[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const [propRes, readyRes, leadRes, visitRes, leadsListRes, recentRes, viewsRes, reviewRes, convertedRes, leadsAIRes] = await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "READY_TO_MOVE"),
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("site_visits").select("id", { count: "exact", head: true }),
      supabase.from("leads").select("created_at").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
      (supabase.from("property_views") as any).select("id", { count: "exact", head: true }).eq("viewed_date", today),
      supabase.from("property_reviews" as any).select("id", { count: "exact", head: true }),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "CONVERTED"),
      // For Groq — get last 20 leads with property name
      (supabase.from("leads") as any).select("name, status, message, created_at, properties(name)").order("created_at", { ascending: false }).limit(20),
    ]);

    setStats({
      total:          propRes.count       ?? 0,
      ready:          readyRes.count      ?? 0,
      leadCount:      leadRes.count       ?? 0,
      visitCount:     visitRes.count      ?? 0,
      viewsToday:     (viewsRes as any).count  ?? 0,
      reviewCount:    (reviewRes as any).count ?? 0,
      convertedLeads: convertedRes.count  ?? 0,
    });

    setLeads((leadsListRes.data as Pick<LeadRow, "created_at">[]) ?? []);
    setRecentLeads((recentRes.data as LeadRow[]) ?? []);

    // Format leads for AI
    const rawLeads = (leadsAIRes.data as any[]) ?? [];
    setLeadsForAI(rawLeads.map((l: any) => ({
      name: l.name, status: l.status,
      property: l.properties?.name ?? null,
      created_at: l.created_at,
      message: l.message ?? null,
    })));

    setLoading(false);
  }

  async function generateInsight() {
    setAiLoading(true);
    setAiError("");
    setAiInsight("");
    try {
      const payload = {
        properties: { total: stats.total, ready: stats.ready, underConstruction: stats.total - stats.ready },
        leads: { total: stats.leadCount, converted: stats.convertedLeads, pending_visits: stats.visitCount },
        today: { pageViews: stats.viewsToday, reviews: stats.reviewCount },
        recent_leads: leadsForAI,
      };
      const insight = await groqChat(AI_SYSTEM, JSON.stringify(payload), 600);
      setAiInsight(insight);
    } catch (e) {
      setAiError("Failed to generate insight. Check your Groq API key.");
    }
    setAiLoading(false);
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const underConstruction = stats.total - stats.ready;
  const readyPct     = stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0;
  const conversionPct = stats.leadCount > 0 ? Math.round((stats.convertedLeads / stats.leadCount) * 100) : 0;

  // Leads by month (last 6)
  const months: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    const count = leads.filter((l) => {
      const c = new Date(l.created_at);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    months.push({ label, count });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.count));
  const circumference = 2 * Math.PI * 42;
  const readyLen = (circumference * readyPct) / 100;

  const statCards = [
    { label: "Total Properties",    value: stats.total,          icon: HomeIcon,     color: "bg-blue-50 text-blue-600",    trend: null },
    { label: "Ready to Move",       value: stats.ready,          icon: CheckCircle2, color: "bg-green-50 text-green-600",  trend: null },
    { label: "Under Construction",  value: underConstruction,    icon: BadgeCheck,   color: "bg-amber-50 text-amber-600",  trend: null },
    { label: "Total Leads",         value: stats.leadCount,      icon: Users,        color: "bg-purple-50 text-purple-600",trend: null },
    { label: "Site Visit Requests", value: stats.visitCount,     icon: CalendarDays, color: "bg-pink-50 text-pink-600",    trend: null },
    { label: "Page Views Today",    value: stats.viewsToday,     icon: Eye,          color: "bg-cyan-50 text-cyan-600",    trend: null },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-line h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-line p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-2xl font-display font-bold leading-none">{s.value}</p>
              <p className="text-xs text-muted mt-1.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Conversion KPI strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Conversion Rate",   value: `${conversionPct}%`,        icon: TrendingUp, color: "text-green-600" },
          { label: "Converted Leads",   value: stats.convertedLeads,        icon: CheckCircle2, color: "text-blue-600" },
          { label: "Pending Visits",    value: stats.visitCount,             icon: CalendarDays, color: "text-amber-600" },
          { label: "Property Reviews",  value: stats.reviewCount,            icon: Star, color: "text-purple-600" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-line px-5 py-4">
            <k.icon className={`w-4 h-4 ${k.color} mb-2`} strokeWidth={2} />
            <p className={`font-display font-bold text-xl ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-line p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold">Leads by Month</h3>
            <button onClick={load} className="text-xs text-muted hover:text-accent flex items-center gap-1 transition">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          <div className="flex items-end gap-3 h-44">
            {months.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                <span className="text-xs font-bold text-ink">{m.count || ""}</span>
                <div className="w-full rounded-t-xl transition-all duration-500"
                  style={{
                    height: `${m.count > 0 ? (m.count / maxMonth) * 100 : 3}%`,
                    background: m.count > 0
                      ? "linear-gradient(180deg, #2952D6 0%, #1A3FA8 100%)"
                      : "#F1F5F9",
                    minHeight: "4px",
                  }}
                />
                <span className="text-[11px] text-muted font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-xl border border-line p-6 flex flex-col items-center">
          <h3 className="font-display font-semibold mb-4 self-start">Property Status</h3>
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#FEF3C7" strokeWidth="13"/>
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="url(#blueGrad)" strokeWidth="13"
                strokeDasharray={`${readyLen} ${circumference}`}
                strokeLinecap="round"/>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1A3FA8"/>
                  <stop offset="100%" stopColor="#2952D6"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display font-black text-2xl text-accent">{readyPct}%</p>
              <p className="text-[10px] text-muted font-medium">Ready</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs mt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #1A3FA8, #2952D6)" }}/>
              Ready ({stats.ready})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300"/>
              Under Const. ({underConstruction})
            </span>
          </div>
        </div>
      </div>

      {/* ── Groq AI Insights ── */}
      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line"
          style={{ background: "linear-gradient(135deg, #050C1A 0%, #0A1628 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">AI Business Insights</p>
              <p className="text-slate-400 text-[11px]">Powered by Groq · llama3-8b</p>
            </div>
          </div>
          <button onClick={generateInsight} disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60 transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", color: "#0A1628" }}>
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
            {aiLoading ? "Analysing…" : aiInsight ? "Regenerate" : "Generate Insight"}
          </button>
        </div>

        <div className="p-6">
          {!aiInsight && !aiLoading && !aiError && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-line flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-slate-300" />
              </div>
              <p className="font-display font-semibold text-slate-700 mb-1">AI Analysis Ready</p>
              <p className="text-sm text-muted max-w-sm mx-auto">
                Click "Generate Insight" to get a Groq AI-powered analysis of your leads, properties, and business performance.
              </p>
            </div>
          )}

          {aiLoading && (
            <div className="flex items-center gap-3 py-6 text-muted justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="text-sm">Analysing your business data with Groq AI…</span>
            </div>
          )}

          {aiError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{aiError}</p>
          )}

          {aiInsight && !aiLoading && (
            <div className="prose prose-sm max-w-none">
              <div className="space-y-3">
                {aiInsight.split("\n").filter(l => l.trim()).map((line, i) => {
                  const isHeader = /^[📊🔥⚡📈]/.test(line);
                  const isBullet = /^[•\-\*]/.test(line.trim());
                  return (
                    <div key={i} className={isHeader
                      ? "flex items-center gap-2 font-display font-bold text-sm text-ink border-b border-line pb-1 mt-4 first:mt-0"
                      : isBullet
                        ? "flex items-start gap-2 text-sm text-slate-600 pl-2"
                        : "text-sm text-slate-600"
                    }>
                      {isBullet && <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"/>}
                      <span>{isBullet ? line.trim().replace(/^[•\-\*]\s*/, "") : line}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent leads ── */}
      {recentLeads.length > 0 && (
        <div className="bg-white rounded-xl border border-line overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h3 className="font-display font-semibold">Recent Leads</h3>
            <Link to="/admin/leads" className="text-xs font-semibold text-accent flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs text-muted uppercase text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Mobile</th>
                <th className="px-5 py-3 font-semibold">Message</th>
                <th className="px-5 py-3 font-semibold">Received</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((l) => (
                <tr key={l.id} className="border-t border-line hover:bg-surface/60">
                  <td className="px-5 py-3 font-medium">{l.name}</td>
                  <td className="px-5 py-3 text-muted">{l.mobile}</td>
                  <td className="px-5 py-3 text-muted max-w-xs truncate">{l.message ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{formatDateShort(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

