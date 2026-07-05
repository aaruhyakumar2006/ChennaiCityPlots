import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/lib/useWishlist";
import PropertyCard from "@/components/PropertyCard";
import type { PropertyCardData } from "@/types";

export default function SavedPage() {
  const { saved } = useWishlist();
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (saved.length === 0) { setProperties([]); return; }
    setLoading(true);
    supabase
      .from("properties")
      .select("id, property_id, name, slug, type, status, location, price, area_min, area_max, plot_size_sqft, facing, configuration, description, views, property_images(url, sort_order)")
      .in("id", saved)
      .then(({ data }) => {
        const rows = (data as PropertyCardData[]) ?? [];
        const ordered = saved
          .map((id) => rows.find((p) => p.id === id))
          .filter((p): p is PropertyCardData => p !== undefined);
        setProperties(ordered);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.join(",")]);

  return (
    <>
      {/* Page header */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-line">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
          <p className="text-sm text-muted mb-1">
            <Link to="/" className="hover:text-accent">Home</Link> / Saved Properties
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">Saved Properties</h1>
              <p className="text-sm text-muted">
                {loading ? "Loading…" : `${properties.length} saved propert${properties.length === 1 ? "y" : "ies"}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-2xl border border-dashed border-line">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <Heart className="w-9 h-9 text-red-300" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">No saved properties yet</h2>
            <p className="text-sm text-muted mb-6 max-w-xs mx-auto">
              Tap the heart icon on any property card to save it here for easy access.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition"
            >
              Browse Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
