import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, X, GitCompareArrows } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useCompare } from "@/lib/useCompare";
import { formatPriceLabel } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

const ROWS: { label: string; key: keyof ReturnType<typeof buildRow>; highlight?: boolean }[] = [
  { label: "Price",           key: "price",         highlight: true },
  { label: "Price / sq.ft",   key: "sqftPrice" },
  { label: "Type",            key: "type" },
  { label: "Status",          key: "status" },
  { label: "Location",        key: "location" },
  { label: "Configuration",   key: "configuration" },
  { label: "Area",            key: "area" },
];

function buildRow(p: ReturnType<typeof useCompare>["items"][number]) {
  const sqftRaw = p.area_min && p.price ? Math.round(p.price / p.area_min) : null;
  return {
    price:         formatPriceLabel(p.price),
    sqftPrice:     sqftRaw ? `₹${sqftRaw.toLocaleString("en-IN")}/sq.ft` : "—",
    type:          p.type === "RESIDENTIAL" ? "Residential" : "Commercial",
    status:        p.status,
    location:      p.location,
    configuration: p.configuration ?? "—",
    area:          p.area_min && p.area_max
                     ? `${p.area_min}–${p.area_max} sq.ft`
                     : p.area_min ? `${p.area_min} sq.ft` : "On request",
  };
}

export default function ComparePage() {
  const { items, clear, toggle } = useCompare();

  if (items.length < 2) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5">
        <Helmet>
          <title>Compare Properties | Madras City Plots</title>
          <meta name="description" content="Compare plots side by side — price, area, location and status. Select any two properties to start comparing." />
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto mb-6">
            <GitCompareArrows className="w-10 h-10 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="font-display font-bold text-2xl mb-3">Compare Properties</h1>
          <p className="text-muted text-sm mb-8">
            Select at least 2 properties using the compare button on any property card to start a side-by-side comparison.
          </p>
          <Link to="/properties"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)" }}>
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Compare Properties | Madras City Plots</title>
        <meta name="description" content="Compare plots side by side — price, area, location and status. Make the right choice with a clear side-by-side view." />
        <meta name="robots" content="noindex" />
      </Helmet>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)" }} className="text-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/properties" className="glass w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/20 transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-display font-bold text-xl">Compare Properties</h1>
                <p className="text-emerald-200 text-xs">{items.length} properties selected</p>
              </div>
            </div>
            <button onClick={clear}
              className="glass px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/20 transition">
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8">
        <div className="overflow-x-auto rounded-2xl border border-line shadow-sm">
          <table className="w-full min-w-[560px] border-collapse bg-white">
            {/* Property headers */}
            <thead>
              <tr className="border-b border-line">
                <th className="w-36 p-5 bg-surface text-left">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Property</p>
                </th>
                {items.map((p) => {
                  const cover = p.property_images?.[0]?.url ?? "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=70";
                  return (
                    <th key={p.id} className="p-5 align-top text-left relative">
                      <button onClick={() => toggle(p)}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition">
                        <X className="w-3 h-3" />
                      </button>
                      <Link to={`/properties/${p.slug}`} className="group block pr-6">
                        <div className="rounded-xl overflow-hidden mb-3 aspect-[4/3]">
                          <img src={cover} alt={p.name} loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <p className="font-display font-bold text-sm leading-snug group-hover:text-accent transition">{p.name}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/8 px-2 py-0.5 rounded-full mt-1.5">
                          <ShieldCheck className="w-3 h-3" /> DTCP Verified
                        </span>
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Comparison rows */}
            <tbody>
              {ROWS.map(({ label, key, highlight }) => (
                <tr key={key} className={`border-b border-line last:border-0 ${highlight ? "bg-accent/[0.03]" : ""}`}>
                  <td className="p-5 bg-surface text-xs text-muted font-semibold uppercase tracking-wide">{label}</td>
                  {items.map((p) => {
                    const row = buildRow(p);
                    const val = row[key];
                    return (
                      <td key={p.id} className={`p-5 text-sm font-medium ${highlight ? "text-accent font-bold text-base" : ""}`}>
                        {key === "status" ? <StatusBadge status={p.status} /> : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {items.map((p) => (
            <Link key={p.id} to={`/properties/${p.slug}`}
              className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-line hover:border-accent hover:bg-accent/3 transition group">
              <span className="text-sm font-semibold text-ink group-hover:text-accent transition line-clamp-1">{p.name}</span>
              <ArrowLeft className="w-4 h-4 text-muted rotate-180 shrink-0 group-hover:text-accent transition" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
