import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Search } from "lucide-react";
import { formatINR, formatPriceLabel } from "@/lib/format";

const LOCATIONS = [
  "OMR, Chennai", "ECR, Chennai", "Porur, Chennai", "Velachery, Chennai", "Anna Nagar, Chennai",
  "Tambaram, Chennai", "Sholinganallur, Chennai", "Guindy, Chennai", "Perumbakkam, Chennai", "Thoraipakkam, Chennai",
];

export default function PropertyFilters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice") ?? 30000000));

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    navigate(`/properties?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-xl2 border border-line shadow-card p-4 md:p-5">
      <div className="grid md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="Search by name or locality"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <select
            defaultValue={searchParams.get("location") ?? "All"}
            onChange={(e) => updateParam("location", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
          >
            <option>All</option>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            defaultValue={searchParams.get("type") ?? "All"}
            onChange={(e) => updateParam("type", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
          >
            <option>All</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            defaultValue={searchParams.get("status") ?? "All"}
            onChange={(e) => updateParam("status", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
          >
            <option>All</option>
            <option value="READY_TO_MOVE">Ready to Move</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            defaultValue={searchParams.get("sort") ?? "latest"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none"
          >
            <option value="latest">Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="most-viewed">Most Viewed</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <label className="text-xs text-muted shrink-0">
          Max budget: <span className="font-semibold text-ink">{formatPriceLabel(maxPrice)}</span>
        </label>
        <input
          type="range"
          min={500000}
          max={30000000}
          step={100000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          onMouseUp={(e) => updateParam("maxPrice", (e.target as HTMLInputElement).value)}
          onTouchEnd={(e) => updateParam("maxPrice", (e.target as HTMLInputElement).value)}
          className="w-full accent-accent"
        />
      </div>
    </div>
  );
}
