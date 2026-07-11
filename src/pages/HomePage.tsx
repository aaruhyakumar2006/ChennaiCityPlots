import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ShieldCheck, FileText, Scale, CalendarCheck, Building2, Headphones } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PropertyCard from "@/components/PropertyCard";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import PropertyMap from "@/components/PropertyMap";
import HeroSection from "@/components/HeroSection";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import HomeLoanSection from "@/components/HomeLoanSection";
import type { PropertyCardData } from "@/types";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://www.madrascityplots.com";

const WHY_US = [
  { icon: ShieldCheck, title: "DTCP & CMDA Verified", desc: "Every plot is verified for DTCP and CMDA approvals before listing — no illegal layouts, no surprises." },
  { icon: FileText, title: "Transparent Pricing", desc: "No hidden charges. Final price, registration and EC costs shown upfront — in writing." },
  { icon: Scale, title: "Legal Assistance", desc: "Our team reviews title deeds, encumbrance certificates and sale agreements for every plot." },
  { icon: CalendarCheck, title: "Easy Site Visits", desc: "Pick a date online — we confirm and take you to the plot. No going alone to unknown areas." },
  { icon: Building2, title: "Trusted Owners", desc: "We list only from owners and developers with clear title history across Chennai." },
  { icon: Headphones, title: "End-to-End Support", desc: "From plot shortlisting to registration — a dedicated relationship manager handles everything." },
];

const LOCATION_PINS: never[] = [];

// ── Scroll-reveal hook ────────────────────────────────────────────────────
function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ── Why Us card (own component to safely use hooks) ───────────────────────
function WhyUsCard({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`group bg-white rounded-xl2 border border-line p-7 hover:border-accent/30
        hover:shadow-[0_12px_40px_-12px_rgba(37,99,235,0.18)] transition-all duration-500 cursor-default
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionProperty: "opacity, transform, box-shadow, border-color",
      }}
    >
      <div className="w-11 h-11 rounded-xl2 bg-accent-50 group-hover:bg-accent group-hover:scale-110 flex items-center justify-center mb-5 transition-all duration-300">
        <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" strokeWidth={1.8} />
      </div>
      <h3 className="font-display font-semibold text-base mb-2 group-hover:text-accent transition-colors duration-300">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Reveal wrapper ────────────────────────────────────────────────────────
function RevealDiv({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <RevealDiv className="text-center max-w-xl mx-auto mb-12 md:mb-14">
      <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-2 flex items-center justify-center gap-2">
        <span className="w-5 h-px bg-accent" />
        {eyebrow}
        <span className="w-5 h-px bg-accent" />
      </p>
      <h2 className="font-display font-bold text-2xl md:text-3xl">{title}</h2>
      {subtitle && <p className="text-muted text-sm mt-3 leading-relaxed">{subtitle}</p>}
    </RevealDiv>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [featured, setFeatured] = useState<PropertyCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [happyBuyers, setHappyBuyers] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [featuredRes, countRes, leadsRes] = await Promise.all([
      supabase
        .from("properties")
        .select("id, property_id, name, slug, type, status, location, price, area_min, area_max, plot_size_sqft, facing, configuration, description, views, property_images(url, sort_order)")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "CONVERTED"),
    ]);
    setFeatured((featuredRes.data as PropertyCardData[]) ?? []);
    setTotalCount(countRes.count ?? 0);
    setHappyBuyers(leadsRes.count ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ── Realtime: update featured when admin changes properties ──
  useEffect(() => {
    const channel = supabase
      .channel("homepage-properties")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <>
      <Helmet>
        <title>Madras City Plots — Premium Real Estate in Chennai</title>
        <meta name="description" content="Find DTCP & CMDA verified residential and commercial plots in Chennai. Transparent pricing, legal assistance and free site visits. 500+ happy families." />
        <meta name="keywords" content="plots for sale Chennai, DTCP approved plots Chennai, CMDA plots Chennai, buy land Chennai, residential plots Chennai, commercial plots Chennai" />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="Madras City Plots — Premium Real Estate in Chennai" />
        <meta property="og:description" content="DTCP & CMDA verified plots in Chennai. Transparent pricing, legal assistance and free site visits." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/placeholder-property.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Madras City Plots — Premium Real Estate in Chennai" />
        <meta name="twitter:description" content="DTCP & CMDA verified plots in Chennai. Transparent pricing, legal assistance and free site visits." />
        <meta name="twitter:image" content={`${SITE_URL}/placeholder-property.png`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Madras City Plots",
          "url": SITE_URL,
          "logo": `${SITE_URL}/favicon.svg`,
          "description": "DTCP & CMDA verified residential and commercial plots in Chennai. Transparent pricing, legal assistance and free site visits.",
          "telephone": "+916369678465",
          "email": "madrascityplot@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Srinivas Flats, Block 2, S1, Ponnuswamy Street, Ullagaram",
            "addressLocality": "Nanganallur, Chennai",
            "addressRegion": "Tamil Nadu",
            "postalCode": "600061",
            "addressCountry": "IN"
          },
          "areaServed": "Chennai",
          "sameAs": []
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <HeroSection totalCount={totalCount} happyBuyers={happyBuyers} />

      {/* ── STATS STRIP ── */}
      <div className="bg-accent">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
          {[
            { value: `${totalCount || "50"}+`, label: "Verified Plots" },
            { value: "100%",                    label: "DTCP Approved" },
            { value: `${happyBuyers || "100"}+`, label: "Happy Families" },
            { value: "12+",                     label: "Years of Trust" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display font-bold text-2xl md:text-3xl">{s.value}</p>
              <p className="text-sm text-white/75 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED PROPERTIES ── */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20">
        <RevealDiv className="flex items-end justify-between mb-10">
          <div>
            <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
              <span className="w-5 h-px bg-accent" />
              Featured Projects
            </p>
            <h2 className="font-display font-bold text-2xl md:text-3xl">Handpicked plots for you</h2>
            <p className="text-muted text-sm mt-2">Curated listings with verified approvals and clear titles.</p>
          </div>
          <Link
            to="/properties"
            className="hidden md:flex items-center gap-1.5 px-5 py-2.5 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition group"
          >
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </RevealDiv>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <RevealDiv key={p.id} delay={i * 80}>
                <PropertyCard property={p} />
              </RevealDiv>
            ))}
          </div>
        ) : (
          <RevealDiv>
            <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-line text-muted">
              <Building2 className="w-10 h-10 text-line mx-auto mb-3" />
              <p className="font-display font-semibold mb-1">No featured properties yet</p>
              <p className="text-sm">Add some from the Admin panel to display them here.</p>
            </div>
          </RevealDiv>
        )}

        <Link
          to="/properties"
          className="md:hidden mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-xl2 bg-accent text-white font-semibold text-sm"
        >
          View all properties <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── RECENTLY VIEWED ── */}
      <div className="border-t border-line">
        <RecentlyViewedSection />
      </div>

      {/* ── WHY CHOOSE US ── */}
      <section id="why-choose-us" className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(180deg,#F8F9FA 0%,#EFF4FF 50%,#F8F9FA 100%)" }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/6 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/6 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <SectionHeader
            eyebrow="Why Choose Us"
            title="Chennai's most trusted plot brokers"
            subtitle="We don't just list plots — we verify them, visit them, and guide you through every step until registration."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_US.map((w, i) => (
              <WhyUsCard key={w.title} icon={w.icon} title={w.title} desc={w.desc} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 py-20">
        <SectionHeader eyebrow="Testimonials" title="What our customers say" />
        <RevealDiv>
          <TestimonialCarousel />
        </RevealDiv>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-4 md:mx-8 lg:mx-auto max-w-7xl mb-20">
        <RevealDiv>
          <div className="relative rounded-3xl overflow-hidden bg-accent px-8 py-14 md:py-16 text-white text-center">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)" }} />
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-3">Ready to invest?</p>
            <h2 className="font-display font-bold text-2xl md:text-4xl mb-4">Find your perfect plot today</h2>
            <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto mb-8">
              Browse verified DTCP &amp; CMDA approved plots across Chennai. Schedule a free site visit with our relationship managers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/properties"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl2 bg-white text-accent font-semibold text-sm hover:bg-white/90 transition"
              >
                Browse Plots <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+916369678465"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl2 border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition"
              >
                Call Us Now
              </a>
            </div>
          </div>
        </RevealDiv>
      </section>

      {/* ── HOME LOAN CTA ── */}
      <HomeLoanSection />

      {/* ── LOCATION HIGHLIGHTS ── */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20">
        <SectionHeader eyebrow="Location Highlights" title="We cover all of Chennai" subtitle="Properties across every major locality — from OMR tech corridor to Anna Nagar residential hubs." />
        <RevealDiv>
          <PropertyMap pins={LOCATION_PINS} zoom={11} center={[13.0674, 80.2376]} />
        </RevealDiv>
      </section>
    </>
  );
}

