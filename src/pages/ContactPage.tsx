import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const OFFICE: [number, number] = [12.9856, 80.1935];

function OfficeMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: true, scrollWheelZoom: false }).setView(OFFICE, 15);
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);
    L.marker(OFFICE).addTo(map).bindPopup("Chennai City Plots").openPopup();
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div className="relative rounded-xl border border-line overflow-hidden" style={{ height: "288px" }}>
      <div ref={ref} className="absolute inset-0 z-0" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Office Address",
    value: "Srinivas Flats, Block 2, S1, 2nd Floor, Plot Nos. 1, 2 & 3 Ponnuswamy Street, Ullagaram, Nanganallur, Chennai 600061",
    sub: "Opp to Sri Krishna Sweets",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 63696 78465",
    href: "tel:+916369678465",
  },
  {
    icon: Mail,
    label: "Email",
    value: "homesChennai City Plots@gmail.com",
    href: "mailto:homesChennai City Plots@gmail.com",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Mon – Sat: 9:00 AM – 7:00 PM",
    sub: "Sunday: By appointment only",
  },
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const { error: err } = await (supabase.from("leads") as any).insert({
      name:    fd.get("name") as string,
      mobile:  fd.get("mobile") as string,
      email:   fd.get("email") as string,
      message: fd.get("message") as string,
      status:  "NEW",
    });
    if (err) { setError(err.message); setStatus("idle"); return; }
    setStatus("done");
    formRef.current?.reset();
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-ink via-slate-900 to-ink text-white py-20 px-5 md:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 25% 40%, #2563eb 0%, transparent 55%), radial-gradient(circle at 75% 60%, #2563eb 0%, transparent 55%)" }} />
        <div className="max-w-7xl mx-auto relative">
          <p className="text-white/50 text-sm mb-4">
            <a href="/" className="hover:text-white transition">Home</a> / Contact
          </p>
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-accent" /> Get In Touch
          </p>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-4">
            We're here to help you<br />
            <span className="text-accent">find the right plot</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl leading-relaxed">
            Have a question about a plot, need a site visit, or want legal guidance? Our team responds within 2 hours.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="tel:+916369678465"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-ink font-semibold text-sm hover:bg-white/90 transition">
              <Phone className="w-4 h-4 text-accent" /> Call Now
            </a>
            <a href="https://wa.me/916369678465?text=Hi%2C%20I%20am%20interested%20in%20buying%20a%20plot."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.58 3.84 1.583 5.4L2 22l4.734-1.546A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid lg:grid-cols-2 gap-12">
        {/* Left — Contact info + map */}
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value, sub, href }) => (
              <div key={label} className="bg-white rounded-2xl border border-line p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-accent" strokeWidth={1.8} />
                </div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-semibold text-ink hover:text-accent transition leading-snug block">{value}</a>
                ) : (
                  <p className="text-sm font-semibold text-ink leading-snug">{value}</p>
                )}
                {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Find Us Here</p>
            <OfficeMap />
            <a
              href="https://maps.google.com/?q=Ponnuswamy+Street+Ullagaram+Nanganallur+Chennai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-accent hover:underline"
            >
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
          </div>
        </div>

        {/* Right — Enquiry form */}
        <div>
          <div className="bg-white rounded-2xl border border-line shadow-sm p-8">
            <h2 className="font-display font-bold text-xl mb-1">Send us a message</h2>
            <p className="text-sm text-muted mb-6">We'll get back to you within 2 hours on working days.</p>

            {status === "done" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-display font-bold text-lg mb-1">Message received!</p>
                <p className="text-sm text-muted mb-5">Our team will call you within 2 hours.</p>
                <button onClick={() => setStatus("idle")} className="text-sm font-semibold text-accent hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-ink-700">Full Name <span className="text-red-500">*</span></span>
                    <input required name="name" placeholder="e.g. Karthik S."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-ink-700">Mobile <span className="text-red-500">*</span></span>
                    <input required name="mobile" type="tel" pattern="[0-9]{10}" placeholder="10-digit number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none" />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink-700">Email <span className="text-red-500">*</span></span>
                  <input required name="email" type="email" placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink-700">Message</span>
                  <textarea name="message" rows={4}
                    placeholder="Tell us about the plot you're looking for — location, budget, size…"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none resize-y" />
                </label>
                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {status === "loading" ? "Sending…" : "Send Message"}
                </button>
                <p className="text-[11px] text-muted text-center">100% confidential. We never share your details.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

