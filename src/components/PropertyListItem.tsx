import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, ArrowRight, Heart, GitCompareArrows } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatPriceLabel } from "@/lib/format";
import { useWishlist } from "@/lib/useWishlist";
import { useCompare } from "@/lib/useCompare";
import type { PropertyCardData } from "@/types";

export default function PropertyListItem({ property }: { property: PropertyCardData }) {
  const { isSaved, toggle } = useWishlist();
  const { isComparing, toggle: toggleCompare, canAdd } = useCompare();

  const coverImage = property.property_images[0]?.url
    ?? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=75";

  const plotLabel = property.plot_size_sqft
    ? `${property.plot_size_sqft} sq.ft`
    : property.area_min && property.area_max
    ? `${property.area_min}–${property.area_max} sq.ft`
    : "Size on request";

  return (
    <div className="group bg-white rounded-xl2 border border-line shadow-card hover:shadow-cardHover transition-all duration-300 flex overflow-hidden">
      {/* Image */}
      <Link to={`/properties/${property.slug}`} className="relative w-52 shrink-0 overflow-hidden">
        <img
          src={coverImage}
          alt={property.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          style={{ backgroundColor: "#F8F9FA" }}
        />
        <div className="absolute top-2 left-2">
          <StatusBadge status={property.status} />
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                to={`/properties/${property.slug}`}
                className="font-display font-semibold text-base leading-snug hover:text-accent transition line-clamp-1"
              >
                {property.name}
              </Link>
              <p className="text-sm text-muted flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {property.location}
              </p>
            </div>
            <p className="font-display font-bold text-lg text-accent shrink-0">
              {formatPriceLabel(property.price)}
            </p>
          </div>

          <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            <span>{property.type === "RESIDENTIAL" ? "Residential Plot" : "Commercial Plot"}</span>
            <span>·</span>
            <span>{plotLabel}</span>
            {property.facing && <><span>·</span><span>{property.facing} Facing</span></>}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent-50 px-2 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3" /> DTCP
            </span>
            <button
              onClick={(e) => { e.preventDefault(); toggleCompare(property); }}
              disabled={!isComparing(property.id) && !canAdd}
              aria-label={isComparing(property.id) ? "Remove from compare" : "Add to compare"}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition disabled:opacity-40 ${isComparing(property.id) ? "border-accent text-accent" : "border-line text-muted hover:border-accent"}`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); toggle(property.id); }}
              aria-label={isSaved(property.id) ? "Remove from saved" : "Save property"}
              className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:border-red-400 transition"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved(property.id) ? "fill-red-500 text-red-500" : "text-muted"}`} />
            </button>
            <Link
              to={`/properties/${property.slug}`}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:gap-2 transition-all"
            >
              View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
