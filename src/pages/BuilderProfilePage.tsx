import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Globe, Phone, Mail, Building2, CheckCircle2, CalendarDays, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PropertyCard from "@/components/PropertyCard";
import type { BuilderRow, PropertyCardData } from "@/types";

export default function BuilderProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [builder, setBuilder] = useState<BuilderRow | null>(null);
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { navigate("/properties", { replace: true }); return; }

    async function fetchBuilder() {
      const { data, error } = await (supabase.from("builders") as any)
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        navigate("/not-found", { replace: true });
        return;
      }

      setBuilder(data as BuilderRow);

      // Only fetch properties belonging to this builder
      const { data: pData } = await (supabase.from("properties") as any)
        .select("id, property_id, name, slug, type, status, location, price, area_min, area_max, configuration, description, views, property_images(url, sort_order)")
        .eq("builder_id", data.id)
        .order("created_at", { ascending: false });

      setProperties((pData as PropertyCardData[]) ?? []);
      setLoading(false);
    }

    fetchBuilder();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 space-y-6">
        <div className="h-40 bg-surface rounded-xl3 animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-surface rounded-xl2 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!builder) return null;

  const stats = [
    { icon: Building2,    label: "Total Projects",     value: builder.total_projects ?? "—" },
    { icon: CheckCircle2, label: "Delivered",           value: builder.delivered_projects ?? "—" },
    { icon: CalendarDays, label: "Established",         value: builder.established_year ?? "—" },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-8">
        <p className="text-sm text-muted mb-5">
          <Link to="/" className="hover:text-accent">Home</Link> /{" "}
          <Link to="/builders" className="hover:text-accent">Builders</Link> /{" "}
          <span className="text-ink">{builder.name}</span>
        </p>
      </div>

      {/* Builder hero card */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 mb-12">
        <div className="bg-white border border-line rounded-xl3 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          {/* Logo */}
          <div className="w-20 h-20 rounded-xl2 border border-line flex items-center justify-center bg-surface shrink-0 overflow-hidden">
            {builder.logo_url ? (
              <img src={builder.logo_url} alt={builder.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-2xl font-display font-bold text-accent">{builder.name.charAt(0)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">{builder.name}</h1>
            {builder.description && <p className="text-sm text-muted leading-relaxed mb-4 max-w-2xl">{builder.description}</p>}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-accent shrink-0" strokeWidth={1.8} />
                  <div>
                    <p className="font-display font-bold text-base leading-none">{value}</p>
                    <p className="text-[11px] text-muted">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="flex flex-wrap gap-4 text-sm">
              {builder.phone && (
                <a href={`tel:${builder.phone}`} className="flex items-center gap-1.5 text-muted hover:text-accent transition">
                  <Phone className="w-4 h-4" /> {builder.phone}
                </a>
              )}
              {builder.email && (
                <a href={`mailto:${builder.email}`} className="flex items-center gap-1.5 text-muted hover:text-accent transition">
                  <Mail className="w-4 h-4" /> {builder.email}
                </a>
              )}
              {builder.website && (
                <a href={builder.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted hover:text-accent transition">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Properties by this builder */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-1">Portfolio</p>
            <h2 className="font-display font-bold text-xl md:text-2xl">Properties by {builder.name}</h2>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-xl3 border border-dashed border-line">
            <Building2 className="w-10 h-10 text-line mx-auto mb-3" />
            <p className="font-display font-semibold mb-1">No properties listed yet</p>
            <p className="text-sm text-muted mb-5">Check back soon or browse all properties.</p>
            <Link to="/properties" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl2 bg-accent text-white text-sm font-semibold">
              Browse All <ArrowRight className="w-4 h-4" />
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
