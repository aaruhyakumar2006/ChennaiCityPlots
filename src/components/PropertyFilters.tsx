import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { formatPriceLabel } from "@/lib/format";

const LOCATIONS = [
  "OMR, Chennai", "ECR, Chennai", "Porur, Chennai", "Velachery, Chennai", "Anna Nagar, Chennai",
  "Tambaram, Chennai", "Sholinganallur, Chennai", "Guindy, Chennai", "Perumbakkam, Chennai",
  "Thoraipakkam, Chennai", "Nanganallur, Chennai", "Chromepet, Chennai", "Medavakkam, Chennai",
  "Pallavaram, Chennai", "Ambattur, Chennai",
];

export default function PropertyFilters() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  // Controlled state — always in sync with URL params
  const [q,        setQ]        = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [type,     setType]     = useState(searchParams.get("type") ?? "");
  const [status,   setStatus]   = useState(searchParams.get("status") ?? "");
  const [sort,     setSort]     = useState(searchParams.get("sort") ?? "latest");
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice") ?? 30000000));

  // Sync back if URL changes externally (e.g. filter chips removed)
  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setLocation(searchParams.get("location") ?? "");
    setType(searchParams.get("type") ?? "");
    setStatus(searchParams.get("status") ?? "");
    setSort(searchParams.get("sort") ?? "latest");
    setMaxPrice(Number(searchParams.get("maxPrice") ?? 30000000));
  }, [searchParams.toString()]);

  function applyParams(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page");
    navigate(`/properties?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-xl2 border border-line shadow-card p-4 md:p-5">
      <div className="grid md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              applyParams({ q: e.target.value, location, type, status, sort });
            }}
            placeholder="Search by name or locality"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
            aria-label="Search properties"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <select
            value={location}
            onChange={(e) => { setLocation(e.target.value); applyParams({ q, location: e.target.value, type, status, sort }); }}
            className="w-full px-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Type */}
        <div className="md:col-span-2">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); applyParams({ q, location, type: e.target.value, status, sort }); }}
            className="w-full px-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
            aria-label="Filter by property type"
          >
            <option value="">All Types</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); applyParams({ q, location, type, status: e.target.value, sort }); }}
            className="w-full px-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
            aria-label="Filter by availability"
          >
            <option value="">All Status</option>
            <option value="READY_TO_MOVE">Ready to Move</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
          </select>
        </div>

        {/* Sort */}
        <div className="md:col-span-2">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); applyParams({ q, location, type, status, sort: e.target.value }); }}
            className="w-full px-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
            aria-label="Sort properties"
          >
            <option value="latest">Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="most-viewed">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Price range */}
      <div className="flex items-center gap-3 mt-4">
        <label htmlFor="max-budget" className="text-xs text-muted shrink-0">
          Max budget: <span className="font-semibold text-ink">{formatPriceLabel(maxPrice)}</span>
        </label>
        <input
          id="max-budget"
          type="range"
          min={500000}
          max={30000000}
          step={100000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          onMouseUp={(e) => applyParams({ q, location, type, status, sort, maxPrice: (e.target as HTMLInputElement).value })}
          onTouchEnd={(e) => applyParams({ q, location, type, status, sort, maxPrice: (e.target as HTMLInputElement).value })}
          className="w-full accent-accent"
        />
      </div>
    </div>
  );
}
