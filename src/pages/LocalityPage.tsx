import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Building2, TrendingUp, MapPin, ArrowRight, BarChart3, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PropertyCard from "@/components/PropertyCard";
import { formatPriceLabel } from "@/lib/format";
import type { PropertyCardData } from "@/types";

function areaLabelFromSlug(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface LocalityStats {
  total: number; avgPrice: number; minPrice: number; maxPrice: number; avgSqft: number;
}

const STAT_CONFIGS = [
  { key: "total",    label: "Total Listings",   format: (s: LocalityStats) => `${s.total} plots`,                                    icon: Building2,  color: "from-accent to-emerald-700" },
  { key: "avgPrice", label: "Avg. Price",        format: (s: LocalityStats) => formatPriceLabel(s.avgPrice),                          icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
  { key: "avgSqft",  label: "Avg. ₹/sq.ft",     format: (s: LocalityStats) => s.avgSqft ? `₹${s.avgSqft.toLocaleString("en-IN")}` : "—", icon: BarChart3,  color: "from-amber-500 to-orange-600" },
  { key: "range",    label: "Price Range",       format: (s: LocalityStats) => `${formatPriceLabel(s.minPrice)} – ${formatPriceLabel(s.maxPrice)}`, icon: MapPin, color: "from-violet-500 to-purple-600" },
];

export default function LocalityPage() {
  const { area } = useParams<{ area: string }>();
  const navigate  = useNavigate();
  const areaLabel = area ? areaLabelFromSlug(area) : "";

  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [stats, setStats]           = useState<LocalityStats | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!area) { navigate("/properties", { replace: true }); return; }
    const searchTerm = area.replace(/-/g, " ");

    supabase
      .from("properties")
      .select("id, property_id, name, slug, type, status, location, price, area_min, area_max, plot_size_sqft, facing, configuration, description, views, property_images(url, sort_order)")
      .ilike("location", `%${searchTerm}%`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const props = (data as PropertyCardData[]) ?? [];
        setProperties(props);
        if (props.length > 0) {
          const prices = props.map((p) => p.price);
          const sqfts  = props.filter((p) => p.area_min).map((p) => p.price / p.area_min!);
          setStats({
            total: props.length,
            avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            avgSqft:  sqfts.length > 0 ? Math.round(sqfts.reduce((a, b) => a + b, 0) / sqfts.length) : 0,
          });
        }
        setLoading(false);
        document.title = `Properties in ${areaLabel} | Madras City Plots`;
      });
    return () => { document.title = "Madras City Plots — Premium Real Estate in Chennai"; };
  }, [area]);

  return (
    <>
      {/* Hero */}
      <div className="relative aurora-bg overflow-hidden">
        <div className="orb w-80 h-80 top-[-6rem] right-[-6rem]"
          style={{ background: "radial-gradient(circle, rgba(15, 82, 68,0.4) 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 relative z-10">
          {/* Breadcrumb */}
          <p className="text-slate-500 text-sm mb-5">
            <Link to="/" className="hover:text-white transition flex items-center gap-1 inline-flex">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            {" / "}
            <Link to="/properties" className="hover:text-white transition">Properties</Link>
            {" / "}
            <span className="text-slate-300">{areaLabel}</span>
          </p>

          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Locality Guide</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white leading-tight mb-3">
            Properties in{" "}
            <span style={{ background: "linear-gradient(90deg, #F59E0B, #FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {areaLabel}
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            {loading ? "Loading listings…" : `${properties.length} verified listing${properties.length !== 1 ? "s" : ""} · Updated regularly`}
          </p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full">
            <path d="M0 40L720 0L1440 40V40H0Z" fill="#F4F6FB"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* Stats */}
        {!loading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {STAT_CONFIGS.map(({ key, label, format, icon: Icon, color }) => (
              <div key={key} className="bg-white rounded-2xl border border-line p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-4.5 h-4.5 text-white" strokeWidth={1.8} />
                </div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{label}</p>
                <p className="font-display font-bold text-base text-ink">{format(stats)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Property grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-2xl border border-dashed border-line">
            <div className="w-16 h-16 rounded-2xl bg-white border border-line flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-muted" />
            </div>
            <p className="font-display font-bold text-lg mb-2">No listings in {areaLabel} yet</p>
            <p className="text-sm text-muted mb-6">We're adding new properties regularly. Check back soon!</p>
            <Link to="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)" }}>
              Browse All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted">
                <span className="font-semibold text-ink">{properties.length}</span> propert{properties.length === 1 ? "y" : "ies"} in {areaLabel}
              </p>
              <Link to={`/properties?location=${encodeURIComponent(areaLabel)}`}
                className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}

