import { ShieldCheck, FileText, Scale, CalendarCheck, Building2, Headphones, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const WHY_US = [
  {
    icon: ShieldCheck, color: "from-accent to-emerald-700",
    title: "DTCP & CMDA Verified",
    desc: "Every plot is verified for DTCP and CMDA approvals before listing — no illegal layouts, no surprises.",
    points: ["DTCP Approved Layouts", "CMDA Approved Plots", "No Encumbrance", "Clear Title Guarantee"],
  },
  {
    icon: FileText, color: "from-emerald-500 to-teal-600",
    title: "Transparent Pricing",
    desc: "No hidden charges. Final price, registration and EC costs are shown upfront — in writing — before you commit.",
    points: ["No Hidden Charges", "Upfront Cost Breakdown", "Registration Assistance", "EC & Legal Fees Clarified"],
  },
  {
    icon: Scale, color: "from-violet-500 to-purple-600",
    title: "Legal Assistance",
    desc: "Our team reviews title deeds, encumbrance certificates and sale agreements for every plot we broker.",
    points: ["Title Deed Verification", "EC Certificate Check", "Sale Agreement Review", "Patta Transfer Support"],
  },
  {
    icon: CalendarCheck, color: "from-amber-500 to-orange-600",
    title: "Easy Site Visits",
    desc: "Pick a date online — we confirm within hours and personally accompany you to the plot.",
    points: ["Online Booking", "Confirmed Within 2 Hours", "Accompanied by Our Team", "All Locations Covered"],
  },
  {
    icon: Building2, color: "from-rose-500 to-pink-600",
    title: "Trusted Plot Owners",
    desc: "We list only from owners with verified ownership and clean history. Every listing is vetted.",
    points: ["Verified Ownership", "Clean Track Record", "No Disputed Lands", "Direct Owner Access"],
  },
  {
    icon: Headphones, color: "from-teal-500 to-accent",
    title: "End-to-End Support",
    desc: "From shortlisting to registration, a dedicated relationship manager handles everything for you.",
    points: ["Dedicated RM", "Shortlisting to Registration", "Bank Loan Coordination", "Post-Sale Support"],
  },
];

const PROCESS = [
  { step: "01", title: "Browse & Shortlist",     desc: "Browse verified plots by location, size and budget. Save your favourites." },
  { step: "02", title: "Book a Site Visit",       desc: "Pick a date online. Our team confirms and accompanies you to the plot." },
  { step: "03", title: "Legal Verification",      desc: "We verify title, EC, and approval documents before you commit." },
  { step: "04", title: "Negotiation & Agreement", desc: "Our team negotiates on your behalf and prepares the sale agreement." },
  { step: "05", title: "Registration",            desc: "We coordinate with the sub-registrar office and guide you through registration." },
];

const STATS = [
  { value: "100%", label: "DTCP Approved" },
  { value: "15+",  label: "Localities" },
  { value: "12+",  label: "Years Experience" },
  { value: "500+", label: "Plots Sold" },
];

export default function WhyUsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden aurora-bg text-white py-24 px-5 md:px-8">
        <div className="orb w-96 h-96 top-[-8rem] right-[-8rem]"
          style={{ background: "radial-gradient(circle, rgba(15, 82, 68,0.4) 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-emerald-400" /> Why Choose Us
          </p>
          <h1 className="font-display font-black text-3xl md:text-5xl lg:text-6xl leading-tight max-w-3xl mb-6">
            Chennai's most trusted<br />
            <span style={{ background: "linear-gradient(90deg, #F59E0B, #FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              plot brokers
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
            We don't just list plots — we verify them, visit them, and guide you through every step until registration. No shortcuts, no surprises.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-xl px-5 py-4 text-center">
                <p className="font-display font-black text-2xl text-white">{s.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <Link to="/properties"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)", boxShadow: "0 4px 20px rgba(15, 82, 68,0.4)" }}>
            Browse Plots <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Why Us Cards */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-2">What Sets Us Apart</p>
          <h2 className="font-display font-bold text-2xl md:text-4xl">Built on trust,<br />backed by process</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_US.map((w) => (
            <div key={w.title}
              className="group bg-white rounded-2xl border border-line p-7 hover:shadow-cardHover hover:border-accent/20 transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${w.color} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                <w.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
              </div>
              <h3 className="font-display font-bold text-base mb-2 group-hover:text-accent transition-colors">{w.title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">{w.desc}</p>
              <ul className="space-y-1.5">
                {w.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-5 md:px-8" style={{ background: "linear-gradient(180deg, #F4F6FB 0%, #EEF2FF 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-accent text-sm font-bold tracking-widest uppercase mb-2">Our Process</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl">How we work with you</h2>
            <p className="text-muted text-sm mt-3">From first browse to final registration — here's exactly what happens.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="relative">
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-full w-full h-0.5 z-0 -translate-x-1/2"
                    style={{ background: "linear-gradient(90deg, #0F5244, #E2E8F0)" }} />
                )}
                <div className="bg-white rounded-2xl border border-line p-5 relative z-10 hover:shadow-md transition-shadow hover:-translate-y-0.5 hover:border-accent/30 duration-200">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 font-display font-black text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)" }}>
                    {p.step}
                  </div>
                  <h3 className="font-display font-bold text-sm mb-2">{p.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 px-4 md:px-8">
        <div className="rounded-3xl overflow-hidden relative text-white text-center py-16 px-8"
          style={{ background: "linear-gradient(135deg, #0A1628 0%, #0F5244 50%, #0A1628 100%)" }}>
          <div className="orb w-96 h-96 -top-32 -right-32"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }} />
          <div className="relative z-10">
            <p className="text-emerald-300 text-sm font-semibold uppercase tracking-widest mb-3">Ready to begin?</p>
            <h2 className="font-display font-bold text-2xl md:text-4xl mb-4">Find your perfect plot today</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">Browse our verified DTCP & CMDA approved plots across Chennai and book a free site visit.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/properties"
                className="px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", color: "#0A1628" }}>
                Browse Plots
              </Link>
              <Link to="/contact"
                className="glass px-7 py-3.5 rounded-xl font-semibold text-sm text-white hover:bg-white/15 transition">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

