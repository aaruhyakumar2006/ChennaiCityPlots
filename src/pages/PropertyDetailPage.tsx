import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, FileText, Download, Play, Share2, Check, Printer, ArrowRight, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyMap from "@/components/PropertyMap";
import InquiryForm from "@/components/InquiryForm";
import SiteVisitScheduler from "@/components/SiteVisitScheduler";
import EmiCalculator from "@/components/EmiCalculator";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import { formatPriceLabel } from "@/lib/format";
import { useRecentlyViewed } from "@/lib/useRecentlyViewed";
import { usePageContext } from "@/lib/usePageContext";
import type { PropertyWithRelations, PropertyCardData } from "@/types";
import PropertyCard from "@/components/PropertyCard";
import PropertyReviews from "@/components/PropertyReviews";

export default function PropertyDetailPage() {
  const { slug }   = useParams<{ slug: string }>();
  const navigate   = useNavigate();
  const { track }  = useRecentlyViewed();
  const { setPropertyName } = usePageContext();
  const [property, setProperty] = useState<PropertyWithRelations | null>(null);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState(false);
  const [similar, setSimilar]   = useState<PropertyCardData[]>([]);
  const [builder, setBuilder]   = useState<{ name: string; slug: string; logo_url: string | null; total_projects: number | null; delivered_projects: number | null } | null>(null);
  const [todayViews, setTodayViews] = useState<number | null>(null);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: property?.name, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  function handlePrint() {
    window.print();
  }

  // Reset page context on unmount
  useEffect(() => () => {
    setPropertyName(null);
  }, []);

  useEffect(() => {
    if (!slug) { navigate("/properties", { replace: true }); return; }

    supabase
      .from("properties")
      .select("*, property_images(id, url, sort_order), documents(id, name, url, type), nearby_places(id, name, category, distance_km), property_videos(id, title, youtube_url)")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          navigate("/not-found", { replace: true });
          return;
        }
        const p = data as PropertyWithRelations;
        setProperty(p);
        setLoading(false);

        // Track recently viewed
        track(p.id);

        // Expose to WhatsApp FAB
        setPropertyName(p.name);

        // SEO is handled by Helmet in JSX below

        // Best-effort view counter
        const typedData = data as PropertyWithRelations;
        (supabase.from("properties") as ReturnType<typeof supabase.from>).update({ views: (typedData.views ?? 0) + 1 } as never).eq("id", typedData.id).then(() => {});

        // Track daily views + count today's views
        const today = new Date().toISOString().slice(0, 10);
        (supabase.from("property_views") as any)
          .insert({ property_id: p.id, viewed_date: today })
          .then(() => {
            (supabase.from("property_views") as any)
              .select("id", { count: "exact", head: true })
              .eq("property_id", p.id)
              .eq("viewed_date", today)
              .then(({ count }: any) => setTodayViews(count ?? 0));
          });

        // Fetch builder if linked
        if (p.builder_id) {
          (supabase.from("builders") as any)
            .select("name, slug, logo_url, total_projects, delivered_projects")
            .eq("id", p.builder_id)
            .single()
            .then(({ data: bData }: any) => { if (bData) setBuilder(bData); });
        }

        // Fetch similar properties — same location or same type, exclude current
        supabase
          .from("properties")
          .select("id, property_id, name, slug, type, status, location, price, area_min, area_max, configuration, description, property_images(url, sort_order)")
          .neq("id", p.id)
          .or(`location.eq.${p.location},type.eq.${p.type}`)
          .limit(3)
          .then(({ data: simData }) => setSimilar((simData as PropertyCardData[]) ?? []));
      });
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="h-[460px] bg-surface rounded-xl3 animate-pulse mb-8" />
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-6 bg-surface rounded animate-pulse" />)}
          </div>
          <div className="h-64 bg-surface rounded-xl2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!property) return null;

  const siteUrl = import.meta.env.VITE_SITE_URL ?? "";
  const seoTitle = (property as any).seo_title?.trim() || `${property.name} — Chennai City Plots`;
  const seoDesc  = (property as any).seo_description?.trim() || property.description.slice(0, 155);
  const seoKw    = (property as any).seo_keywords?.trim();
  const canonical = `${siteUrl}/properties/${property.slug}`;
  const ogImage  = property.property_images?.[0]?.url;

  const overviewFields: [string, string | number][] = [
    ["Plot ID",         property.property_id],
    ["Plot Size",       property.plot_size_sqft ? `${property.plot_size_sqft} sq.ft` : property.area_min && property.area_max ? `${property.area_min} – ${property.area_max} sq.ft` : "On request"],
    ["Dimensions",     property.dimensions ?? "—"],
    ["Facing",         property.facing ?? "—"],
    ["Plot Type",      property.type === "RESIDENTIAL" ? "Residential" : "Commercial"],
    ["Approval",       property.approval_status ?? "—"],
    ["DTCP / CMDA No.",property.rera_number ?? "—"],
    ["Survey No.",     property.dimensions ?? "—"],
    ["Available Units",property.available_units ?? "—"],
    ["Possession",     (property as any).possession_year ? String((property as any).possession_year) : "—"],
  ];

  const defaultLoan = property.price ? Math.round(property.price * 0.8) : undefined;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        {seoKw && <meta name="keywords" content={seoKw} />}
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={canonical} />
        {ogImage && <meta property="og:image" content={ogImage} />}
      </Helmet>
      <section className="max-w-7xl mx-auto px-5 md:px-8 pt-8 print:hidden">
        <p className="text-sm text-muted mb-5">
          <Link to="/" className="hover:text-accent">Home</Link>{" "}
          / <Link to="/properties" className="hover:text-accent">Properties</Link>{" "}
          / <span className="text-ink">{property.name}</span>
        </p>
      </section>

      {/* Print header — only visible when printing */}
      <div className="hidden print:block px-8 py-6 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold">{property.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{property.location} • {formatPriceLabel(property.price)}</p>
        <p className="text-gray-400 text-xs mt-1">chennaicityplots.com/properties/{property.slug}</p>
      </div>

      <section className="max-w-7xl mx-auto px-5 md:px-8">
        <PropertyGallery images={property.property_images} name={property.name} />
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* OVERVIEW */}
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={property.status} />
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent-50 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-4 h-4" /> DTCP Approved
                  </span>
                  {todayViews !== null && todayViews > 1 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full animate-pulse">
                      👁 {todayViews} viewing today
                    </span>
                  )}
                </div>
                <h1 className="font-display font-bold text-2xl md:text-3xl">{property.name}</h1>
                <p className="text-muted mt-1.5">{property.location}</p>
              </div>
              <p className="font-display font-bold text-2xl text-accent">{formatPriceLabel(property.price)}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 bg-surface rounded-xl2 p-5">
              {overviewFields.map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted mb-0.5">{k}</p>
                  <p className="text-sm font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h2 className="font-display font-semibold text-xl mb-3">About this plot</h2>
            <p className="text-sm md:text-base text-muted leading-relaxed">{property.description}</p>
          </div>

          {/* AMENITIES */}
          {property.amenities.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-xl mb-5">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 bg-surface rounded-xl2 px-4 py-3.5">
                    <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                    </span>
                    <span className="text-sm font-medium">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMI CALCULATOR */}
          <div className="print:hidden">
            <h2 className="font-display font-semibold text-xl mb-5">Loan Eligibility Calculator</h2>
            <EmiCalculator defaultLoanAmount={defaultLoan} />
          </div>

          {/* LOCATION ADVANTAGES */}
          <div>
            <h2 className="font-display font-semibold text-xl mb-5">Location &amp; Nearby</h2>
            <PropertyMap
              propertyName={property.name}
              pins={property.nearby_places.slice(0, 6).map((n) => ({
                label: n.name,
                category: n.category,
              }))}
              center={
                property.latitude && property.longitude
                  ? [property.latitude, property.longitude]
                  : undefined
              }
            />
            {property.nearby_places.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {property.nearby_places.map((n) => (
                  <div key={n.id} className="flex items-center justify-between text-sm bg-surface rounded-xl2 px-4 py-3">
                    <span className="font-medium">{n.name} <span className="text-muted font-normal">· {n.category}</span></span>
                    <span className="text-accent font-semibold">{n.distance_km.toFixed(1)} km</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DOCUMENTS */}
          {property.documents.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-xl mb-5">Project Documents</h2>
              <div className="space-y-3">
                {property.documents.map((d) => (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between border border-line rounded-xl2 px-4 py-3.5 hover:border-accent transition"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted" />
                      <span className="text-sm font-medium">{d.name}</span>
                    </div>
                    <Download className="w-5 h-5 text-accent" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* VIDEOS */}
          {property.property_videos.length > 0 && (
            <div className="print:hidden">
              <h2 className="font-display font-semibold text-xl mb-5">Property Videos</h2>
              <div className="space-y-4">
                {property.property_videos.map((v) => (
                  <div key={v.id} className="aspect-video rounded-xl2 overflow-hidden border border-line">
                    <iframe
                      src={v.youtube_url}
                      title={v.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUILDER INFO */}
          {builder && (
            <div>
              <h2 className="font-display font-semibold text-xl mb-4">About the Developer</h2>
              <Link
                to={`/builders/${builder.slug}`}
                className="flex items-center gap-4 bg-surface rounded-xl2 p-4 border border-line hover:border-accent transition group"
              >
                <div className="w-12 h-12 rounded-xl2 border border-line bg-white flex items-center justify-center shrink-0 overflow-hidden">
                  {builder.logo_url
                    ? <img src={builder.logo_url} alt={builder.name} className="w-full h-full object-contain p-1" />
                    : <Building2 className="w-5 h-5 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm group-hover:text-accent transition">{builder.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {[builder.total_projects && `${builder.total_projects} Projects`, builder.delivered_projects && `${builder.delivered_projects} Delivered`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition" />
              </Link>
            </div>
          )}

          {/* REVIEWS */}
          <div className="print:hidden">
            <PropertyReviews propertyId={property.id} />
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-1 print:hidden">
          <div className="sticky top-24 space-y-6">
            <InquiryForm propertyId={property.id} />
            <SiteVisitScheduler propertyId={property.id} />
            {/* Share + Print */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl2 border border-line text-sm font-semibold hover:border-accent hover:text-accent transition"
              >
                {copied ? <Check className="w-4 h-4 text-ok" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share"}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl2 border border-line text-sm font-semibold hover:border-accent hover:text-accent transition"
              >
                <Printer className="w-4 h-4" />
                Print PDF
              </button>
            </div>
            <div className="bg-surface rounded-xl2 p-5 text-sm text-muted flex items-start gap-3">
              <Play className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              All site visits are accompanied by a verified relationship manager — we take you directly to the plot, no middlemen.
            </div>
          </div>
        </aside>
      </section>

      {/* SIMILAR PROPERTIES */}
      {similar.length > 0 && (
        <section className="print:hidden max-w-7xl mx-auto px-5 md:px-8 py-14 border-t border-line">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-1">You may also like</p>
              <h2 className="font-display font-bold text-xl md:text-2xl">Similar Plots</h2>
            </div>
            <Link to={`/properties?location=${encodeURIComponent(property.location)}`} className="hidden md:flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all">
              View all in {property.location} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED */}
      <div className="print:hidden border-t border-line mt-8">
        <RecentlyViewedSection excludeId={property.id} />
      </div>
    </>
  );
}

