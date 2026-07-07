import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { groqChat } from "@/lib/groq";

const EXAMPLES = [
  "Plot under 10L in Tambaram",
  "Commercial space in Guindy",
  "Ready to move plot in OMR",
  "DTCP plot under 50L in ECR",
];

const SYSTEM = `You are a real estate search assistant for a Chennai property platform.
Extract search filters from the user's natural language query and return ONLY a valid JSON object with these optional keys:
- q: string (keyword)
- location: string (Chennai locality, e.g. "OMR, Chennai")
- type: "RESIDENTIAL" | "COMMERCIAL"
- status: "READY_TO_MOVE" | "UNDER_CONSTRUCTION"
- maxPrice: number (in INR rupees, e.g. 5000000 for 50L)
- minPlot: number (min plot size in sq.ft)
- maxPlot: number (max plot size in sq.ft)

Rules:
- Convert "L" or "lakh" to rupees (* 100000), "Cr" or "crore" to rupees (* 10000000)
- Only include keys that are clearly mentioned
- Return ONLY the JSON object, no explanation, no markdown
- Localities: OMR, ECR, Porur, Velachery, Anna Nagar, Tambaram, Sholinganallur, Guindy, Perumbakkam, Thoraipakkam, Nanganallur, Chromepet, Medavakkam, Pallavaram, Ambattur, Avadi`;

// Fallback local parser for when Groq is unavailable / rate limited
function localParse(q: string): Record<string, string> {
  const lower = q.toLowerCase();
  const params: Record<string, string> = {};
  if (q.trim()) params.q = q;

  if (/commercial|office|shop|retail/.test(lower)) params.type = "COMMERCIAL";
  else if (/residential|flat|plot|villa|house|apartment/.test(lower)) params.type = "RESIDENTIAL";

  if (/ready\s*to\s*move|ready/.test(lower)) params.status = "READY_TO_MOVE";
  if (/under\s*construction|new\s*launch/.test(lower)) params.status = "UNDER_CONSTRUCTION";

  const crM = lower.match(/(\d+\.?\d*)\s*(cr|crore)/);
  const lM  = lower.match(/(\d+\.?\d*)\s*(l\b|lakh|lakhs)/);
  if (crM)   params.maxPrice = String(Math.round(parseFloat(crM[1]) * 1e7));
  else if (lM) params.maxPrice = String(Math.round(parseFloat(lM[1]) * 1e5));

  const locs: [RegExp, string][] = [
    [/\bomr\b/, "OMR, Chennai"], [/\becr\b/, "ECR, Chennai"],
    [/porur/, "Porur, Chennai"], [/velachery/, "Velachery, Chennai"],
    [/anna\s*nagar/, "Anna Nagar, Chennai"], [/tambaram/, "Tambaram, Chennai"],
    [/sholinganallur/, "Sholinganallur, Chennai"], [/guindy/, "Guindy, Chennai"],
    [/perumbakkam/, "Perumbakkam, Chennai"], [/thoraipakkam/, "Thoraipakkam, Chennai"],
    [/nanganallur/, "Nanganallur, Chennai"], [/chromepet/, "Chromepet, Chennai"],
    [/medavakkam/, "Medavakkam, Chennai"], [/pallavaram/, "Pallavaram, Chennai"],
  ];
  for (const [rx, loc] of locs) { if (rx.test(lower)) { params.location = loc; break; } }

  return params;
}

export default function NaturalSearchBar() {
  const [value,   setValue]   = useState("");
  const [loading, setLoading] = useState(false);
  const [hint,    setHint]    = useState("");
  const navigate = useNavigate();

  async function search(query = value) {
    if (!query.trim()) return;
    setLoading(true);
    setHint("");

    let params: Record<string, string> = {};

    try {
      const raw = await groqChat(SYSTEM, query.trim(), 256);
      // Extract JSON — Groq sometimes wraps in ```json ... ```
      const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;
      const parsed  = JSON.parse(jsonStr);

      // Convert numeric values to strings for URLSearchParams
      Object.entries(parsed).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") params[k] = String(v);
      });

      // Show what was understood
      const parts: string[] = [];
      if (params.location) parts.push(params.location.split(",")[0]);
      if (params.type)     parts.push(params.type === "RESIDENTIAL" ? "Residential" : "Commercial");
      if (params.status)   parts.push(params.status === "READY_TO_MOVE" ? "Ready to move" : "Under construction");
      if (params.maxPrice) parts.push(`≤ ₹${(Number(params.maxPrice) / 100000).toFixed(0)}L`);
      if (parts.length)    setHint(`🔍 ${parts.join(" · ")}`);
    } catch {
      // Groq failed or rate-limited → fall back to local parser
      params = localParse(query.trim());
    }

    const qs = new URLSearchParams(params).toString();
    setLoading(false);
    navigate(`/properties?${qs}`);
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Input */}
      <div className="flex items-center gap-2 rounded-xl px-4 py-3"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}>
        <Sparkles className="w-4 h-4 text-gold-400 shrink-0" style={{ color: "#FBBF24" }} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. DTCP plot under 50L near OMR…"
          className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
        />
        <button
          onClick={() => search()}
          disabled={loading || !value.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)" }}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
          {loading ? "Thinking…" : "Search"}
        </button>
      </div>

      {/* AI hint */}
      {hint && (
        <p className="text-[11px] text-amber-300/80 mt-1.5 pl-1 font-medium">{hint}</p>
      )}

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {EXAMPLES.map((ex) => (
          <button key={ex} onClick={() => { setValue(ex); search(ex); }}
            className="text-[11px] text-white/60 hover:text-white/90 px-3 py-1.5 rounded-full transition"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {ex}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/25 mt-2 pl-1 flex items-center gap-1">
        <Sparkles className="w-2.5 h-2.5" /> Powered by Groq AI
      </p>
    </div>
  );
}
