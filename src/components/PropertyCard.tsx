import { Link } from "react-router-dom";
import { useState } from "react";
import { MapPin, ArrowRight, Heart, GitCompareArrows, MessageCircle, Eye, ShieldCheck } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatPriceLabel } from "@/lib/format";
import { useWishlist } from "@/lib/useWishlist";
import { useCompare } from "@/lib/useCompare";
import { useUserAuth } from "@/lib/useUserAuth";
import QuickEnquireModal from "./QuickEnquireModal";
import type { PropertyCardData } from "@/types";

export default function PropertyCard({ property }: { property: PropertyCardData }) {
  const { isSaved, toggle } = useWishlist();
  const { isComparing, toggle: toggleCompare, canAdd } = useCompare();
  const { user, openGate } = useUserAuth();
  const [enquireOpen, setEnquireOpen] = useState(false);

  const coverImage =
    property.property_images?.[0]?.url ??
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

  const plotLabel =
    property.plot_size_sqft
      ? `${property.plot_size_sqft.toLocaleString("en-IN")} sq.ft`
      : property.area_min && property.area_max
      ? `${property.area_min}–${property.area_max} sq.ft`
      : "Size on request";

  const saved = isSaved(property.id);

  return (
    <>
      <Link
        to={`/properties/${property.slug}`}
        className="group bg-white rounded-2xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
      >
        {/* Image */}
        <div className="relative overflow-hidden h-52 bg-surface">
          <img
            src={coverImage}
            alt={property.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Top actions */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {/* Compare */}
            <button
              onClick={(e) => { e.preventDefault(); toggleCompare(property); }}
              aria-label={isComparing(property.id) ? "Remove from compare" : "Add to compare"}
              disabled={!isComparing(property.id) && !canAdd}
              className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow transition hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed ${
                isComparing(property.id) ? "text-accent" : "text-muted"
              }`}
            >
              <GitCompareArrows className="w-4 h-4" />
            </button>

            {/* Save / Heart */}
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!user) { openGate("Sign in to save properties to your wishlist"); return; }
                toggle(property.id);
              }}
              aria-label={saved ? "Remove from saved" : "Save property"}
              className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow transition hover:scale-110 ${
                saved ? "text-red-500" : "text-muted"
              }`}
            >
              <Heart className={`w-4 h-4 transition ${saved ? "fill-red-500" : ""}`} />
            </button>
          </div>

          {/* Bottom badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StatusBadge status={property.status} />
            </div>
            <div className="flex items-center gap-1.5">
              {property.views > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black/50 text-white backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <Eye className="w-3 h-3" /> {property.views.toLocaleString("en-IN")}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/90 text-accent px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> DTCP
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Type chip */}
          <span className="text-[11px] font-semibold text-muted bg-surface rounded-full px-2.5 py-0.5 self-start mb-2">
            {property.type === "RESIDENTIAL" ? "Residential Plot" : "Commercial Plot"}
          </span>

          <h3 className="font-display font-semibold text-base leading-snug mb-1 group-hover:text-accent transition-colors">
            {property.name}
          </h3>

          <p className="text-sm text-muted flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
            {property.location}
          </p>

          {/* Price + size row */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-muted mb-0.5">Starting from</p>
              <p className="font-display font-bold text-xl text-ink">{formatPriceLabel(property.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted mb-0.5">Plot size</p>
              <p className="text-sm font-semibold text-ink">{plotLabel}</p>
            </div>
          </div>

          {property.configuration && (
            <p className="text-xs text-muted mb-3 bg-surface rounded-lg px-3 py-1.5">{property.configuration}</p>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-line flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setEnquireOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-accent border border-accent/30 bg-accent/5 px-3 py-1.5 rounded-xl2 hover:bg-accent hover:text-white transition"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Enquire
            </button>

            <span className="text-sm font-semibold text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>

      {enquireOpen && (
        <QuickEnquireModal
          propertyId={property.id}
          propertyName={property.name}
          onClose={() => setEnquireOpen(false)}
        />
      )}
    </>
  );
}
