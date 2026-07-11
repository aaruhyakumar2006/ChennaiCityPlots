import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, MapPin, Phone, Star, TrendingUp, CheckCircle, Building2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPriceLabel } from "@/lib/format";
import NaturalSearchBar from "@/components/NaturalSearchBar";

const WORDS = ["DTCP Approved", "CMDA Verified", "Dream Plot", "Best Investment", "Ready to Move"];

const STATS = [
  { icon: Building2, value: "50+",  label: "Verified Plots" },
  { icon: Users,     value: "100+", label: "Happy Families" },
  { icon: MapPin,    value: "15+",  label: "Localities" },
  { icon: Star,      value: "4.9",  label: "Google Rating" },
];

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter() {
  const [idx, setIdx]     = useState(0);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  useEffect(() => {
    const t = setTimeout(() => {
      if      (phase === "in")   setPhase("hold");
      else if (phase === "hold") setPhase("out");
      else                       { setIdx(i => (i + 1) % WORDS.length); setPhase("in"); }
    }, phase === "hold" ? 2200 : phase === "in" ? 400 : 280);
    return () => clearTimeout(t);
  }, [phase]);
  return (
    <span className="inline-flex items-center" style={{ height: "1.2em", overflow: "clip", verticalAlign: "bottom" }}>
      <span
        key={`${idx}-${phase}`}
        className={phase === "in" ? "typewriter-slide-in" : phase === "out" ? "typewriter-slide-out" : ""}
        style={{
          fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "inherit", lineHeight: "inherit",
          background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 50%, #1D4ED8 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
        {WORDS[idx]}
      </span>
    </span>
  );
}

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = to / 40;
      const t = setInterval(() => {
        start += step;
        if (start >= to) { setVal(to); clearInterval(t); }
        else setVal(Math.round(start));
      }, 30);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Floating card ─────────────────────────────────────────────────────────────
interface HeroCard {
  name: string; location: string; price: string; sqft: string;
  badge: string; img: string; tag: string; slug: string;
}

const PLACEHOLDER_CARDS: HeroCard[] = [
  { name: "Premium Residential Plot", location: "OMR, Chennai",      price: "₹45L+", sqft: "1200 sq.ft", badge: "DTCP", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80", tag: "Available",  slug: "/properties" },
  { name: "Commercial Land",          location: "Tambaram, Chennai",  price: "₹28L+", sqft: "800 sq.ft",  badge: "CMDA", img: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=400&q=80", tag: "Hot Deal",   slug: "/properties" },
  { name: "Gated Community Plot",     location: "ECR, Chennai",       price: "₹72L+", sqft: "2400 sq.ft", badge: "DTCP", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", tag: "New Launch", slug: "/properties" },
];

function FloatingCard({ card, style }: { card: HeroCard; style: React.CSSProperties }) {
  return (
    <div
      className="absolute bg-white rounded-2xl shadow-2xl overflow-hidden w-56 border border-slate-100"
      style={{ ...style, animation: "floatY 6s ease-in-out infinite" }}
    >
      <div className="relative h-28 overflow-hidden">
        <img src={card.img} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute top-2 left-2 text-[10px] font-bold bg-accent text-white px-2 py-0.5 rounded-full">
          {card.badge}
        </span>
        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          card.tag === "Hot Deal" ? "bg-red-500 text-white" :
          card.tag === "New Launch" ? "bg-amber-500 text-white" :
          "bg-green-500 text-white"
        }`}>
          {card.tag}
        </span>
      </div>
      <div className="p-3">
        <p className="font-display font-bold text-xs text-ink leading-tight mb-0.5">{card.name}</p>
        <p className="text-[10px] text-muted flex items-center gap-0.5 mb-2">
          <MapPin className="w-2.5 h-2.5" />{card.location}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm text-accent">{card.price}</p>
          <p className="text-[10px] text-muted bg-slate-50 px-1.5 py-0.5 rounded-md">{card.sqft}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function HeroSection({ totalCount, happyBuyers = 0 }: { totalCount: number; happyBuyers?: number }) {
  const [up, setUp] = useState(false);
  const [cards, setCards] = useState<HeroCard[]>(PLACEHOLDER_CARDS);

  useEffect(() => { const t = setTimeout(() => setUp(true), 80); return () => clearTimeout(t); }, []);

  // Load real featured properties for the floating cards
  useEffect(() => {
    supabase
      .from("properties")
      .select("name, slug, location, price, plot_size_sqft, area_min, status, property_images(url, sort_order)")
      .eq("featured", true)
      .limit(3)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const mapped: HeroCard[] = data.map((p: any, i: number) => ({
          name:     p.name,
          location: p.location,
          price:    formatPriceLabel(p.price),
          sqft:     p.plot_size_sqft
            ? `${p.plot_size_sqft.toLocaleString("en-IN")} sq.ft`
            : p.area_min ? `From ${p.area_min} sq.ft` : "On request",
          badge:    "DTCP",
          img:      p.property_images?.[0]?.url ?? PLACEHOLDER_CARDS[i % 3].img,
          tag:      p.status === "READY_TO_MOVE" ? "Available" : "Coming Soon",
          slug:     `/properties/${p.slug}`,
        }));
        // Pad with placeholders if fewer than 3
        while (mapped.length < 3) mapped.push(PLACEHOLDER_CARDS[mapped.length]);
        setCards(mapped);
      });
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white" style={{ minHeight: "92vh" }}>

      {/* ── Background pattern ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, #E2E8F0 1px, transparent 0)",
        backgroundSize: "32px 32px",
        opacity: 0.6,
      }} />

      {/* ── Blue gradient blob top-right ── */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none" style={{
        background: "radial-gradient(circle, rgba(29,78,216,0.08) 0%, transparent 70%)",
      }} />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none" style={{
        background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
      }} />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 items-center min-h-[92vh] py-20">

        {/* LEFT ── */}
        <div
          style={{
            transition: "opacity 0.9s ease, transform 0.9s ease",
            opacity: up ? 1 : 0,
            transform: up ? "translateY(0)" : "translateY(28px)",
          }}
        >
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-full px-4 py-1.5 mb-7">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-accent text-xs font-bold tracking-wide">Chennai's #1 Trusted Plot Broker</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-ink leading-[1.1] mb-5" style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)" }}>
            Find Your<br />
            Perfect{" "}
            <span className="relative inline-block">
              <Typewriter />
              {/* Underline accent */}
              <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-accent/20" />
            </span>
            <br />
            Plot in Chennai
          </h1>

          <p className="text-slate-500 text-base md:text-lg max-w-lg leading-relaxed mb-8">
            Verified CMDA &amp; DTCP approved plots across all major Chennai localities.
            Transparent pricing, legal assistance and end-to-end support.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { icon: ShieldCheck, label: "DTCP Verified" },
              { icon: ShieldCheck, label: "CMDA Approved" },
              { icon: MapPin,      label: "15+ Localities" },
              { icon: TrendingUp,  label: "RERA Listed" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                <Icon className="w-3.5 h-3.5 text-accent" />{label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              to="/properties"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)", boxShadow: "0 4px 20px rgba(29,78,216,0.35)" }}
            >
              Browse All Plots <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+916369678465"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-accent bg-accent/8 border border-accent/20 hover:bg-accent/15 transition-all"
            >
              <Phone className="w-4 h-4" /> Call Us Now
            </a>
          </div>

          {/* AI Search */}
          <div className="mb-10">
            <NaturalSearchBar />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            {[
              { value: totalCount > 0 ? totalCount : 50, suffix: "+", label: "Verified Plots" },
              { value: 15,                               suffix: "+", label: "Localities" },
              { value: happyBuyers > 0 ? happyBuyers : 100, suffix: "+", label: "Happy Buyers" },
              { value: 12,                               suffix: "+", label: "Years Trust" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-black text-ink text-xl md:text-2xl leading-none">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="text-muted text-[11px] mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT ── floating cards visual ── */}
        <div className="hidden lg:flex items-center justify-center relative" style={{ minHeight: "560px" }}>

          {/* Central circle */}
          <div className="relative w-72 h-72 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", border: "2px dashed rgba(29,78,216,0.2)" }}>

            {/* Inner circle */}
            <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center text-center shadow-xl"
              style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)" }}>
              <Building2 className="w-8 h-8 text-white/80 mb-2" />
              <p className="font-display font-black text-white text-2xl leading-none">{totalCount || 50}+</p>
              <p className="text-blue-200 text-xs mt-1 font-medium">Active Plots</p>
            </div>

            {/* Orbiting dots */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div key={deg} className="absolute w-2.5 h-2.5 rounded-full bg-accent/40"
                style={{ transform: `rotate(${deg}deg) translateX(144px)` }} />
            ))}
          </div>

          {/* Floating cards */}
          <FloatingCard card={cards[0]} style={{ top: "0px", right: "20px", animationDelay: "0s" }} />
          <FloatingCard card={cards[1]} style={{ bottom: "40px", right: "0px", animationDelay: "-2s", animationDuration: "7s" }} />
          <FloatingCard card={cards[2]} style={{ top: "160px", left: "-10px", animationDelay: "-4s", animationDuration: "8s" }} />

          {/* Verified badge floating */}
          <div className="absolute top-1/2 right-[-20px] -translate-y-1/2 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 border border-slate-100"
            style={{ animation: "floatY 5s ease-in-out 1s infinite" }}>
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">100% Verified</p>
              <p className="text-[10px] text-muted">DTCP &amp; CMDA</p>
            </div>
          </div>

          {/* Happy buyers badge */}
          <div className="absolute bottom-20 left-[-30px] bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 border border-slate-100"
            style={{ animation: "floatY 6s ease-in-out 2s infinite" }}>
            <div className="flex -space-x-2">
              {["#1D4ED8", "#7C3AED", "#DB2777"].map((c) => (
                <div key={c} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-ink">{happyBuyers || 100}+ Families</p>
              <p className="text-[10px] text-muted">Trusted us</p>
            </div>
          </div>

          {/* Rating badge */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2 border border-slate-100"
            style={{ animation: "floatY 7s ease-in-out 0.5s infinite" }}>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-xs font-bold text-ink">4.9 Rating</p>
          </div>
        </div>
      </div>

      {/* ── Bottom wave ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 48L60 40C120 32 240 16 360 10.7C480 5.3 600 10.7 720 16C840 21.3 960 26.7 1080 24C1200 21.3 1320 10.7 1380 5.3L1440 0V48H0Z" fill="#F4F6FB" />
        </svg>
      </div>
    </section>
  );
}
