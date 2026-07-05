import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, MapPin, Phone, Star, TrendingUp } from "lucide-react";
import NaturalSearchBar from "@/components/NaturalSearchBar";

// ── Cycling words for typewriter ─────────────────────────────────────────────
const WORDS = ["DTCP Approved", "CMDA Verified", "RERA Certified", "Dream Plot", "Best Investment"];

// ── Plot layout data ──────────────────────────────────────────────────────────
const PLOTS = [
  { x: 8,  y: 12, w: 18, h: 14, label: "A1", price: "₹45L", delay: 0,   status: "sold"      },
  { x: 28, y: 12, w: 22, h: 14, label: "A2", price: "₹62L", delay: 0.25,status: "available" },
  { x: 52, y: 12, w: 16, h: 14, label: "A3", price: "₹38L", delay: 0.5, status: "available" },
  { x: 70, y: 12, w: 20, h: 14, label: "A4", price: "₹55L", delay: 0.75,status: "booked"    },
  { x: 8,  y: 34, w: 22, h: 16, label: "B1", price: "₹72L", delay: 0.35,status: "available" },
  { x: 32, y: 34, w: 18, h: 16, label: "B2", price: "₹48L", delay: 0.6, status: "available" },
  { x: 52, y: 34, w: 38, h: 16, label: "B3", price: "₹95L", delay: 0.85,status: "sold"      },
  { x: 8,  y: 58, w: 30, h: 18, label: "C1", price: "₹85L", delay: 0.45,status: "available" },
  { x: 40, y: 58, w: 22, h: 18, label: "C2", price: "₹58L", delay: 0.7, status: "booked"    },
  { x: 64, y: 58, w: 26, h: 18, label: "C3", price: "₹76L", delay: 0.95,status: "available" },
];

const S = {
  available: { fill: "rgba(41,82,214,0.22)",  stroke: "#5B80F0", text: "#A5BCFF" },
  sold:      { fill: "rgba(239,68,68,0.18)",   stroke: "#f87171", text: "#FECACA" },
  booked:    { fill: "rgba(245,158,11,0.2)",   stroke: "#FCD34D", text: "#FDE68A" },
} as const;

// ── Plot grid SVG ─────────────────────────────────────────────────────────────
function PlotGrid() {
  const [hov, setHov] = useState<number | null>(null);
  const [on, setOn]   = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 500); return () => clearTimeout(t); }, []);

  return (
    <svg viewBox="0 0 100 90" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="g" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0L0 0 0 5" fill="none" stroke="rgba(79,114,232,0.1)" strokeWidth="0.25"/>
        </pattern>
        <filter id="glow"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="100" height="90" fill="url(#g)" />

      {/* Roads */}
      <rect x="0" y="0"  width="100" height="8"  fill="rgba(15,25,50,0.85)"/>
      <rect x="0" y="28" width="100" height="4"  fill="rgba(15,25,50,0.7)"/>
      <rect x="0" y="52" width="100" height="4"  fill="rgba(15,25,50,0.7)"/>
      <rect x="0" y="78" width="100" height="12" fill="rgba(15,25,50,0.85)"/>
      <line x1="0" y1="4" x2="100" y2="4" stroke="rgba(253,224,71,0.25)" strokeWidth="0.3" strokeDasharray="3 2"/>
      <text x="50" y="5.5" textAnchor="middle" fill="rgba(148,163,184,0.8)" fontSize="2" fontFamily="monospace">MAIN ROAD — 40ft</text>
      <text x="50" y="55.5" textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="1.7" fontFamily="monospace">CROSS ROAD — 30ft</text>

      {/* North compass */}
      <g transform="translate(93.5,4.5)">
        <circle cx="0" cy="0" r="3.8" fill="rgba(10,22,40,0.9)" stroke="rgba(79,114,232,0.5)" strokeWidth="0.5"/>
        <path d="M0,-3.2 L1,-0.5 L0,0.8 L-1,-0.5Z" fill="#5B80F0"/>
        <path d="M0,3.2 L1,0.5 L0,-0.8 L-1,0.5Z" fill="rgba(255,255,255,0.15)"/>
        <text x="0" y="-4.5" textAnchor="middle" fill="#93B4FF" fontSize="1.9" fontWeight="bold">N</text>
      </g>

      {/* Plots */}
      {PLOTS.map((p, i) => {
        const c = S[p.status as keyof typeof S];
        const isH = hov === i;
        const cx  = p.x + p.w / 2;
        const cy  = p.y + p.h / 2;
        return (
          <g key={i} style={{
            opacity: on ? 1 : 0,
            transform: on ? "scale(1)" : "scale(0.8)",
            transformOrigin: `${cx}% ${cy}%`,
            transition: `opacity 0.5s ease ${p.delay}s, transform 0.5s ease ${p.delay}s`,
            cursor: "pointer",
          }} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            {isH && <rect x={p.x-0.5} y={p.y-0.5} width={p.w+1} height={p.h+1} fill={c.stroke} opacity="0.12" rx="1.2" filter="url(#glow)"/>}
            <rect x={p.x+0.4} y={p.y+0.4} width={p.w-0.8} height={p.h-0.8}
              fill={isH ? c.fill.replace(/[\d.]+\)$/, m => String(parseFloat(m)+0.15)+")") : c.fill}
              stroke={c.stroke} strokeWidth={isH ? 0.75 : 0.45} rx="0.8"
              style={{ transition: "all 0.18s ease" }}/>
            <line x1={p.x+1.5} y1={p.y+p.h-2} x2={p.x+p.w-1.5} y2={p.y+p.h-2} stroke={c.stroke} strokeWidth="0.2" strokeDasharray="1 0.5" opacity="0.45"/>
            <line x1={p.x+p.w-2} y1={p.y+1.5} x2={p.x+p.w-2} y2={p.y+p.h-1.5} stroke={c.stroke} strokeWidth="0.2" strokeDasharray="1 0.5" opacity="0.45"/>
            <text x={cx} y={cy-1.8} textAnchor="middle" fill={c.text} fontSize="2.5" fontWeight="700" fontFamily="sans-serif">{p.label}</text>
            <text x={cx} y={cy+0.9} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="2.1" fontFamily="sans-serif" fontWeight="600">{p.price}</text>
            <text x={cx} y={cy+3.6} textAnchor="middle" fill={c.text} fontSize="1.55" fontFamily="sans-serif" style={{ textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.8 }}>{p.status}</text>
          </g>
        );
      })}

      {/* Scan line */}
      <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(79,114,232,0.6)" strokeWidth="0.4"
        style={{ animation: "scanLine 5s ease-in-out infinite" }}/>

      {/* Legend */}
      <g transform="translate(3,82)">
        {[["#5B80F0","Available"],["#FCD34D","Booked"],["#f87171","Sold"]].map(([col,lbl],i) => (
          <g key={lbl} transform={`translate(${i*30},0)`}>
            <rect width="4" height="2.8" fill={col} opacity="0.3" stroke={col} strokeWidth="0.35" rx="0.4"/>
            <text x="5.5" y="2.2" fill="rgba(148,163,184,0.85)" fontSize="1.9" fontFamily="sans-serif">{lbl}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter() {
  const [idx, setIdx]   = useState(0);
  const [phase, setPhase] = useState<"in"|"hold"|"out">("in");
  useEffect(() => {
    const t = setTimeout(() => {
      if      (phase === "in")   setPhase("hold");
      else if (phase === "hold") setPhase("out");
      else                       { setIdx(i => (i+1) % WORDS.length); setPhase("in"); }
    }, phase === "hold" ? 2400 : phase === "in" ? 450 : 320);
    return () => clearTimeout(t);
  }, [phase]);
  return (
    <span className="inline-flex items-center" style={{ height: "1.25em", overflow: "clip", verticalAlign: "bottom" }}>
      <span key={`${idx}-${phase}`}
        className={phase === "in" ? "typewriter-slide-in" : phase === "out" ? "typewriter-slide-out" : ""}
        style={{
          fontFamily: "Poppins, sans-serif", fontWeight: 800,
          fontSize: "inherit", lineHeight: "inherit",
          background: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)",
          backgroundSize: "200% 100%", animation: phase === "hold" ? "goldShimmer 2.5s linear infinite" : undefined,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
        {WORDS[idx]}
      </span>
      <span className="typewriter-cursor ml-1.5" style={{ background: "#F59E0B" }} />
    </span>
  );
}

// ── Counter animation ─────────────────────────────────────────────────────────
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

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function HeroSection({ totalCount, happyBuyers = 0 }: { totalCount: number; happyBuyers?: number }) {
  const [up, setUp] = useState(false);
  useEffect(() => { const t = setTimeout(() => setUp(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "96vh",
        background: "linear-gradient(145deg, #03070F 0%, #060D1E 30%, #0A1628 60%, #040A18 100%)",
      }}
    >
      {/* ── Animated mesh gradient ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(26,63,168,0.45) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 110%, rgba(245,158,11,0.18) 0%, transparent 55%)",
        animation: "auroraShift 10s ease-in-out infinite",
      }}/>

      {/* ── Grid lines ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(79,114,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,114,232,0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}/>

      {/* ── Glow orbs ── */}
      <div className="absolute pointer-events-none" style={{ width:700, height:700, top:-300, left:-250, borderRadius:"50%", background:"radial-gradient(circle, rgba(26,63,168,0.4) 0%, transparent 65%)", filter:"blur(40px)", animation:"orbFloat 12s ease-in-out infinite" }}/>
      <div className="absolute pointer-events-none" style={{ width:550, height:550, top:"15%", right:-200, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 65%)", filter:"blur(40px)", animation:"orbFloat 16s ease-in-out 3s infinite" }}/>
      <div className="absolute pointer-events-none" style={{ width:400, height:400, bottom:-150, left:"35%", borderRadius:"50%", background:"radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)", filter:"blur(50px)", animation:"orbFloat 20s ease-in-out 7s infinite" }}/>

      {/* ── Micro particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width:  `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            background: i % 5 === 0 ? "rgba(245,158,11,0.8)" : i % 3 === 0 ? "rgba(99,102,241,0.7)" : "rgba(79,114,232,0.6)",
            left: `${(i * 3.7 + 2) % 100}%`,
            top:  `${(i * 6.3 + 8) % 100}%`,
            opacity: 0.3 + (i % 4) * 0.15,
            animation: `floatParticle ${5 + i % 8}s ease-in-out ${(i * 0.45) % 6}s infinite alternate`,
          }}/>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-10 items-center py-24 min-h-[96vh]">

        {/* LEFT */}
        <div style={{ transition: "opacity 0.8s ease, transform 0.8s ease", opacity: up ? 1 : 0, transform: up ? "translateY(0)" : "translateY(32px)" }}>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 stat-float"
            style={{ animationDelay: "0.15s", background: "linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)", backgroundSize: "200% 100%", animation: "goldShimmer 3s linear infinite, statFloat 0.75s 0.15s both" }}>
            <Star className="w-3.5 h-3.5 text-amber-900 fill-amber-900 shrink-0"/>
            <span className="text-amber-900 text-xs font-bold tracking-wide uppercase">Chennai's #1 Trusted Plot Broker</span>
          </div>

          {/* Headline */}
          <div style={{ perspective: "900px" }} className="mb-4">
            <h1 className="font-display font-black text-white leading-tight" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}>
              {["Find", "Your", "Dream"].map((w, i) => (
                <span key={w} className="inline-block mr-[0.2em]">
                  <span className="hero-word inline-block" style={{ animationDelay: `${i * 0.13 + 0.3}s` }}>{w}</span>
                </span>
              ))}
            </h1>
            {/* Typewriter line */}
            <div className="stat-float" style={{ animationDelay: "0.65s", fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1.2 }}>
              <Typewriter />
            </div>
          </div>

          <p className="text-slate-400 text-base md:text-lg max-w-md leading-relaxed mb-8 stat-float" style={{ animationDelay: "0.8s" }}>
            Verified CMDA &amp; DTCP approved plots, villa projects and construction solutions across all major Chennai localities.
          </p>

          {/* Verification badges */}
          <div className="flex flex-wrap gap-2.5 mb-8 stat-float" style={{ animationDelay: "0.9s" }}>
            {[
              { icon: ShieldCheck, label: "DTCP Verified" },
              { icon: ShieldCheck, label: "CMDA Approved" },
              { icon: MapPin,      label: "15+ Localities" },
              { icon: TrendingUp,  label: "RERA Listed" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 px-3.5 py-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                <Icon className="w-3.5 h-3.5 text-blue-400" />{label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-9 stat-float" style={{ animationDelay: "1s" }}>
            <Link to="/properties" className="cta-glow group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #1A3FA8 0%, #2952D6 100%)", boxShadow: "0 6px 30px rgba(26,63,168,0.55)" }}>
              Browse Plots <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <a href="tel:+916369678465" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm text-white transition hover:bg-white/15"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
              <Phone className="w-4 h-4 text-blue-400"/> Call Now
            </a>
          </div>

          {/* Search */}
          <div className="stat-float mb-10" style={{ animationDelay: "1.05s" }}>
            <NaturalSearchBar />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 stat-float" style={{ animationDelay: "1.15s" }}>
            {[
              { to: totalCount > 0 ? totalCount : 50, suffix: "+", label: "Active Plots" },
              { to: 15, suffix: "+",  label: "Localities" },
              { to: happyBuyers > 0 ? happyBuyers : 100, suffix: "+", label: "Happy Buyers" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display font-black text-white text-2xl md:text-3xl leading-none">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-slate-500 text-xs mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Plot viewer */}
        <div className="hidden lg:block stat-float" style={{ animationDelay: "0.5s" }}>
          <div className="relative w-full rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "10/9",
              background: "rgba(3,8,20,0.92)",
              border: "1px solid rgba(79,114,232,0.35)",
              boxShadow: "0 0 0 1px rgba(79,114,232,0.1), 0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(26,63,168,0.2)",
              transform: "perspective(1400px) rotateY(-5deg) rotateX(2deg)",
              transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "perspective(1400px) rotateY(0deg) rotateX(0deg)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "perspective(1400px) rotateY(-5deg) rotateX(2deg)")}
          >
            {/* Chrome bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5"
              style={{ background: "rgba(5,12,28,0.95)", borderBottom: "1px solid rgba(79,114,232,0.2)" }}>
              <div className="flex gap-1.5">
                {["#FF5F57","#FFBD2E","#28CA41"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }}/>)}
              </div>
              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Plot Layout — DTCP Approved</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                <span className="text-[10px] font-mono text-green-400 font-bold">LIVE</span>
              </div>
            </div>

            {/* Map */}
            <div className="absolute inset-0 top-9">
              <PlotGrid />
            </div>

            {/* Scan sweep */}
            <div className="absolute inset-0 top-9 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(26,63,168,0.06) 50%, transparent 100%)",
                animation: "scanOverlay 4.5s ease-in-out infinite",
              }}/>

            {/* Inner frame glow */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ boxShadow: "inset 0 0 40px rgba(26,63,168,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" }}/>
          </div>

          <p className="text-center text-[11px] text-slate-600 mt-3 font-mono tracking-widest uppercase">
            Interactive Plot Layout Viewer
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2 stat-float"
        style={{ animationDelay: "1.6s" }}>
        <span className="text-slate-600 text-[10px] tracking-widest uppercase font-medium">Scroll</span>
        <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="w-1 h-2 rounded-full bg-blue-500" style={{ animation: "scrollDot 1.8s ease-in-out infinite" }}/>
        </div>
      </div>

      {/* Bottom wave into next section */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 56L80 46C160 36 320 16 480 10.7C640 5.3 800 16 960 21.3C1120 26.7 1280 26.7 1360 26.7L1440 26.7V56H0Z" fill="#F4F6FB"/>
        </svg>
      </div>
    </section>
  );
}

