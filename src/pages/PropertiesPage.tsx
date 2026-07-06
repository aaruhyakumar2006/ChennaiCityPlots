import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LayoutGrid, List, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PropertyCard from "@/components/PropertyCard";
import PropertyListItem from "@/components/PropertyListItem";
import PropertySidebar from "@/components/PropertySidebar";
import { formatPriceLabel } from "@/lib/format";
import type { PropertyCardData } from "@/types";

const PAGE_SIZE = 9;

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const page     = Math.max(1, Number(searchParams.get("page") ?? 1));
  const q        = searchParams.get("q") ?? "";
  const location = searchParams.get("location") ?? "";
  const type     = searchParams.get("type") ?? "";
  const status   = searchParams.get("status") ?? "";
  const minPrice       = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPrice       = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const minPlot        = searchParams.get("minPlot")  ? Number(searchParams.get("minPlot"))  : null;
  const maxPlot        = searchParams.get("maxPlot")  ? Number(searchParams.get("maxPlot"))  : null;
  const sort           = searchParams.get("sort") ?? "latest";

  // Active filter chips — everything except sort/page
  const FILTER_KEYS = ["q", "location", "type", "status", "minPrice", "maxPrice", "minPlot", "maxPlot"];
  const FILTER_LABELS: Record<string, (v: string) => string> = {
    q:        (v) => `"${v}"`,
    location: (v) => v,
    type:     (v) => v === "RESIDENTIAL" ? "Residential" : "Commercial",
    status:   (v) => v === "READY_TO_MOVE" ? "Available" : "Upcoming",
    minPrice: (v) => `≥ ${formatPriceLabel(Number(v))}`,
    maxPrice: (v) => `≤ ${formatPriceLabel(Number(v))}`,
    minPlot:  (v) => `Plot ≥ ${v} sq.ft`,
    maxPlot:  (v) => `Plot ≤ ${v} sq.ft`,
  };
  const activeFilters = FILTER_KEYS.flatMap((k) => {
    const v = searchParams.get(k);
    return v ? [{ key: k, label: FILTER_LABELS[k](v) }] : [];
  });

  function removeFilter(key: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    p.delete("page");
    navigate(`/properties?${p.toString()}`);
  }
  function clearAll() { navigate("/properties"); }

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("properties")
      .select(
        "id, property_id, name, slug, type, status, location, price, area_min, area_max, plot_size_sqft, facing, configuration, description, views, property_images(url, sort_order)",
        { count: "exact" }
      );

    if (q)         query = query.or(`name.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`);
    if (location && location !== "All") query = query.eq("location", location);
    if (type     && type !== "All")     query = query.eq("type", type);
    if (status   && status !== "All")   query = query.eq("status", status);
    if (minPrice)  query = query.gte("price", minPrice);
    if (maxPrice)  query = query.lte("price", maxPrice);
    if (minPlot)   query = query.gte("plot_size_sqft", minPlot);
    if (maxPlot)   query = query.lte("plot_size_sqft", maxPlot);

    if (sort === "price-low")  query = query.order("price", { ascending: true });
    else if (sort === "price-high") query = query.order("price", { ascending: false });
    else if (sort === "most-viewed") query = query.order("views", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;
    setProperties((data as PropertyCardData[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [q, location, type, status, minPrice, maxPrice, minPlot, maxPlot, sort, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildPageHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `/properties?${params.toString()}`;
  }

  return (
    <>
      <Helmet>
        <title>Properties — Madras City Plots</title>
        <meta name="description" content="Explore our curated listings of residential and commercial properties across Chennai." />
        <meta property="og:title" content="Properties — Madras City Plots" />
        <meta property="og:description" content="Explore our curated listings of residential and commercial properties across Chennai." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ── Page Hero ── */}
      <div className="bg-gradient-to-r from-accent to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <p className="text-white/70 text-sm font-medium mb-1">
            <Link to="/" className="hover:text-white transition">Home</Link> / Properties
          </p>
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">Browse All Plots</h1>
          <p className="text-white/75 text-sm">
            {loading ? "Loading…" : `${total} verified plot${total === 1 ? "" : "s"} across Chennai`}
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-line sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <p className="text-sm text-muted shrink-0">
            <span className="font-semibold text-ink">{loading ? "…" : total}</span> plot{total === 1 ? "" : "s"}
          </p>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
              {activeFilters.map(({ key, label }) => (
                <span key={key} className="flex items-center gap-1 shrink-0 text-xs font-medium bg-accent/8 text-accent border border-accent/20 rounded-full px-3 py-1">
                  {label}
                  <button onClick={() => removeFilter(key)} aria-label={`Remove ${label} filter`}>
                    <X className="w-3 h-3 ml-0.5 hover:text-red-500" />
                  </button>
                </span>
              ))}
              <button onClick={clearAll} className="shrink-0 text-xs text-red-500 hover:text-red-600 font-medium transition">
                Clear all
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => {
                const p = new URLSearchParams(searchParams.toString());
                p.set("sort", e.target.value); p.delete("page");
                navigate(`/properties?${p.toString()}`);
              }}
              className="hidden md:block text-xs px-3 py-2 rounded-xl border border-line bg-surface focus:border-accent focus:outline-none"
            >
              <option value="latest">Latest first</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="most-viewed">Most Viewed</option>
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line text-xs font-semibold hover:border-accent transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="flex border border-line rounded-xl overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`p-2 transition ${view === "grid" ? "bg-accent text-white" : "hover:bg-surface text-muted"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 transition ${view === "list" ? "bg-accent text-white" : "hover:bg-surface text-muted"}`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 flex gap-8">
        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-72 shrink-0">
          <PropertySidebar />
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative ml-auto w-80 max-w-full bg-white h-full overflow-y-auto p-5 animate-slideInRight shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-semibold">Filters</p>
                <button onClick={() => setSidebarOpen(false)} aria-label="Close filters" className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <PropertySidebar onApply={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={view === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className={`bg-surface rounded-2xl animate-pulse ${view === "grid" ? "h-80" : "h-36"}`} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-24 bg-surface rounded-2xl border border-dashed border-line">
              <div className="w-16 h-16 rounded-2xl bg-white border border-line flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="w-7 h-7 text-muted" />
              </div>
              <p className="font-display font-semibold text-lg mb-2">No plots match your filters</p>
              <p className="text-sm text-muted mb-6">Try widening your budget or clearing a filter.</p>
              <button onClick={clearAll} className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition">
                Reset Filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((p) => <PropertyListItem key={p.id} property={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <Link
                to={buildPageHref(Math.max(1, page - 1))}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition ${page === 1 ? "opacity-30 pointer-events-none border-line" : "border-line hover:border-accent hover:text-accent"}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-muted text-sm">…</span>
                  ) : (
                    <Link
                      key={p}
                      to={buildPageHref(p as number)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold border transition ${p === page ? "bg-accent text-white border-accent" : "border-line hover:border-accent hover:text-accent"}`}
                    >
                      {p}
                    </Link>
                  )
                )}
              <Link
                to={buildPageHref(Math.min(totalPages, page + 1))}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition ${page === totalPages ? "opacity-30 pointer-events-none border-line" : "border-line hover:border-accent hover:text-accent"}`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

