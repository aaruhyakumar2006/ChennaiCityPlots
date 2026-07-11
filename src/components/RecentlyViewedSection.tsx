import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRecentlyViewed } from "@/lib/useRecentlyViewed";
import PropertyCard from "@/components/PropertyCard";
import type { PropertyCardData } from "@/types";

interface Props {
  excludeId?: string;
}

export default function RecentlyViewedSection({ excludeId }: Props) {
  const { ids } = useRecentlyViewed();
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredIds = excludeId ? ids.filter((id) => id !== excludeId) : ids;

  useEffect(() => {
    if (filteredIds.length === 0) { setProperties([]); return; }
    setLoading(true);
    supabase
      .from("properties")
      .select("id, property_id, name, slug, type, status, location, price, area_min, area_max, configuration, description, property_images(url, sort_order)")
      .in("id", filteredIds)
      .then(({ data }) => {
        const rows = (data as PropertyCardData[]) ?? [];
        // Preserve view order
        const ordered = filteredIds
          .map((id) => rows.find((p) => p.id === id))
          .filter((p): p is PropertyCardData => p !== undefined);
        setProperties(ordered);
        setLoading(false);
      });
  }, [filteredIds.join(",")]);

  if (filteredIds.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
            <span className="w-5 h-px bg-accent" />
            Recently Viewed
          </p>
          <h2 className="font-display font-bold text-xl md:text-2xl flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            Properties you've explored
          </h2>
        </div>
        <Link
          to="/properties"
          className="hidden md:flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: Math.min(3, filteredIds.length) }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl2 h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </section>
  );
}
