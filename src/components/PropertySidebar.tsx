import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, Clock, X } from "lucide-react";
import { formatPriceLabel } from "@/lib/format";

const LOCATIONS = [
  "OMR, Chennai", "ECR, Chennai", "Porur, Chennai", "Velachery, Chennai",
  "Anna Nagar, Chennai", "Tambaram, Chennai", "Sholinganallur, Chennai",
  "Guindy, Chennai", "Perumbakkam, Chennai", "Thoraipakkam, Chennai",
];

const PLOT_SIZES = ["Below 600", "600–1200", "1200–2400", "2400+"];

const HISTORY_KEY = "pdh_search_history";
const SAVED_KEY   = "pdh_saved_searches";
const MAX_HISTORY = 6;

interface SavedSearch { label: string; url: string; }

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function saveToHistory(url: string) {
  if (!url || url === "/properties") return;
  const prev = getHistory().filter((u) => u !== url);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([url, ...prev].slice(0, MAX_HISTORY)));
}
function getSaved(): SavedSearch[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]"); } catch { return []; }
}

function labelFromParams(p: URLSearchParams): string {
  const parts: string[] = [];
  if (p.get("q"))        parts.push(`"${p.get("q")}"`);
  if (p.get("location")) parts.push(p.get("location")!);
  if (p.get("config"))   parts.push(p.get("config")!);
  if (p.get("type"))     parts.push(p.get("type") === "RESIDENTIAL" ? "Residential" : "Commercial");
  if (p.get("status"))   parts.push(p.get("status") === "READY_TO_MOVE" ? "Ready to Move" : "Under Construction");
  if (p.get("maxPrice")) parts.push(`≤ ${formatPriceLabel(Number(p.get("maxPrice")))}`);
  if (p.get("possessionYear")) parts.push(`By ${p.get("possessionYear")}`);
  return parts.length > 0 ? parts.join(" · ") : "All Properties";
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line pb-4 mb-4 last:border-0 last:mb-0">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-sm font-semibold text-ink mb-3">
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>
      {open && children}
    </div>
  );
}

export default function PropertySidebar({ onApply }: { onApply?: () => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [q,              setQ]             = useState(searchParams.get("q") ?? "");
  const [location,       setLocation]      = useState(searchParams.get("location") ?? "");
  const [type,           setType]          = useState(searchParams.get("type") ?? "");
  const [status,         setStatus]        = useState(searchParams.get("status") ?? "");
  const [minPrice,       setMinPrice]      = useState(Number(searchParams.get("minPrice") ?? 500000));
  const [maxPrice,       setMaxPrice]      = useState(Number(searchParams.get("maxPrice") ?? 30000000));
  const [minPlot,        setMinPlot]       = useState(searchParams.get("minPlot") ?? "");
  const [maxPlot,        setMaxPlot]       = useState(searchParams.get("maxPlot") ?? "");

  const [history,      setHistory]      = useState<string[]>(getHistory);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(getSaved);

  // refresh history/saved on mount
  useEffect(() => {
    setHistory(getHistory());
    setSavedSearches(getSaved());
  }, []);

  function buildParams() {
    const p = new URLSearchParams();
    if (q)       p.set("q", q);
    if (location) p.set("location", location);
    if (type)    p.set("type", type);
    if (status)  p.set("status", status);
    if (minPrice > 500000)   p.set("minPrice", String(minPrice));
    if (maxPrice < 30000000) p.set("maxPrice", String(maxPrice));
    if (minPlot) p.set("minPlot", minPlot);
    if (maxPlot) p.set("maxPlot", maxPlot);
    const sort = searchParams.get("sort");
    if (sort) p.set("sort", sort);
    return p;
  }

  function apply() {
    const p = buildParams();
    const url = `/properties?${p.toString()}`;
    saveToHistory(url);
    setHistory(getHistory());
    navigate(url);
    onApply?.();
  }

  function reset() {
    setQ(""); setLocation(""); setType(""); setStatus("");
    setMinPrice(500000); setMaxPrice(30000000);
    setMinPlot(""); setMaxPlot("");
    navigate("/properties");
    onApply?.();
  }

  function saveSearch() {
    const p = buildParams();
    const url = `/properties?${p.toString()}`;
    const label = labelFromParams(p);
    const prev = getSaved().filter((s) => s.url !== url);
    const next = [{ label, url }, ...prev].slice(0, 5);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    setSavedSearches(next);
  }

  function removeSaved(url: string) {
    const next = getSaved().filter((s) => s.url !== url);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    setSavedSearches(next);
  }

  function removeHistory(url: string) {
    const next = getHistory().filter((u) => u !== url);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setHistory(next);
  }

  const isSaved = savedSearches.some((s) => {
    const p = buildParams();
    return s.url === `/properties?${p.toString()}`;
  });

  const inputCls = "w-full px-3 py-2.5 rounded-xl border-[1.5px] border-line text-sm focus:border-accent focus:outline-none bg-white";

  return (
    <div className="bg-white rounded-2xl border border-line shadow-sm p-5 sticky top-32">

      {/* Search History */}
      {history.length > 0 && (
        <Section title="Recent Searches" defaultOpen={false}>
          <div className="space-y-1.5">
            {history.map((url) => {
              const params = new URLSearchParams(url.replace("/properties?", ""));
              return (
                <div key={url} className="flex items-center gap-1.5 group">
                  <button onClick={() => { navigate(url); onApply?.(); }}
                    className="flex-1 flex items-center gap-2 text-xs text-muted hover:text-accent transition truncate text-left">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="truncate">{labelFromParams(params)}</span>
                  </button>
                  <button onClick={() => removeHistory(url)} className="opacity-0 group-hover:opacity-100 transition">
                    <X className="w-3 h-3 text-muted hover:text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Section title="Saved Searches" defaultOpen={false}>
          <div className="space-y-1.5">
            {savedSearches.map((s) => (
              <div key={s.url} className="flex items-center gap-1.5 group">
                <button onClick={() => { navigate(s.url); onApply?.(); }}
                  className="flex-1 flex items-center gap-2 text-xs text-muted hover:text-accent transition truncate text-left">
                  <BookmarkCheck className="w-3 h-3 shrink-0 text-accent" />
                  <span className="truncate">{s.label}</span>
                </button>
                <button onClick={() => removeSaved(s.url)} className="opacity-0 group-hover:opacity-100 transition">
                  <X className="w-3 h-3 text-muted hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Keyword search */}
      <Section title="Search">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Name, locality, keyword…"
            className={`${inputCls} pl-9`}
            onKeyDown={(e) => e.key === "Enter" && apply()} />
        </div>
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {LOCATIONS.map((l) => (
            <label key={l} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="location" checked={location === l}
                onChange={() => setLocation(location === l ? "" : l)} className="accent-accent" />
              <span className="text-sm text-ink-700 group-hover:text-accent transition">{l}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Property Type */}
      <Section title="Property Type">
        <div className="flex gap-2">
          {["RESIDENTIAL", "COMMERCIAL"].map((t) => (
            <button key={t} onClick={() => setType(type === t ? "" : t)}
              className={`flex-1 py-2 rounded-xl2 text-xs font-semibold border transition ${type === t ? "bg-accent text-white border-accent" : "border-line hover:border-accent"}`}>
              {t === "RESIDENTIAL" ? "Residential" : "Commercial"}
            </button>
          ))}
        </div>
      </Section>

      {/* Status */}
      <Section title="Availability">
        <div className="space-y-1.5">
          {[{ value: "READY_TO_MOVE", label: "Available Now" }, { value: "UNDER_CONSTRUCTION", label: "Upcoming" }].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="status" checked={status === value}
                onChange={() => setStatus(status === value ? "" : value)} className="accent-accent" />
              <span className="text-sm text-ink-700 group-hover:text-accent transition">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Plot Size Quick Select */}
      <Section title="Plot Size (sq.ft)">
        <div className="flex flex-wrap gap-2 mb-3">
          {PLOT_SIZES.map((range) => {
            const [min, max] = range === "2400+" ? ["2400", ""] : range === "Below 600" ? ["", "600"] : range.split("–");
            const active = minPlot === min && maxPlot === max;
            return (
              <button key={range}
                onClick={() => { setMinPlot(active ? "" : min); setMaxPlot(active ? "" : max); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${active ? "bg-accent text-white border-accent" : "border-line hover:border-accent"}`}>
                {range}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input type="number" placeholder="Min sq.ft" value={minPlot} onChange={(e) => setMinPlot(e.target.value)} className={inputCls} />
          <input type="number" placeholder="Max sq.ft" value={maxPlot} onChange={(e) => setMaxPlot(e.target.value)} className={inputCls} />
        </div>
      </Section>

      {/* Budget */}
      <Section title="Budget">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-accent">{formatPriceLabel(minPrice)}</span>
            <span className="text-muted text-[10px]">to</span>
            <span className="text-accent">{formatPriceLabel(maxPrice)}</span>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] text-muted mb-1"><span>Min</span><span>₹5L — ₹3Cr</span></div>
            <input type="range" min={500000} max={30000000} step={100000} value={minPrice}
              onChange={(e) => { const v = Number(e.target.value); setMinPrice(v); if (v >= maxPrice) setMaxPrice(Math.min(30000000, v + 500000)); }}
              className="w-full accent-accent" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] text-muted mb-1"><span>Max</span><span>₹5L — ₹3Cr</span></div>
            <input type="range" min={500000} max={30000000} step={100000} value={maxPrice}
              onChange={(e) => { const v = Number(e.target.value); setMaxPrice(v); if (v <= minPrice) setMinPrice(Math.max(500000, v - 500000)); }}
              className="w-full accent-accent" />
          </div>
        </div>
      </Section>

      <div className="space-y-2 mt-2">
        <div className="flex gap-2">
          <button onClick={reset}
            className="flex-1 py-2.5 rounded-xl border border-line text-sm font-semibold hover:border-red-400 hover:text-red-500 transition">
            Reset
          </button>
          <button onClick={apply}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)" }}>
            Apply Filters
          </button>
        </div>
        <button onClick={saveSearch}
          className={`w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${isSaved ? "border-accent text-accent bg-accent/5" : "border-line text-muted hover:border-accent hover:text-accent"}`}>
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          {isSaved ? "Search Saved ✓" : "Save This Search"}
        </button>
      </div>
    </div>
  );
}
