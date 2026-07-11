import { useState, useRef } from "react";
import { BadgeIndianRupee, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const BUDGETS = [
  "Under ₹30 Lakhs",
  "₹30 – ₹60 Lakhs",
  "₹60 Lakhs – ₹1 Crore",
  "₹1 Crore – ₹2 Crore",
  "Above ₹2 Crore",
];

export default function HomeLoanSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError]   = useState("");
  const formRef             = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setStatus("loading");
    const fd     = new FormData(e.currentTarget);
    const budget = fd.get("budget") as string;
    const { error: err } = await (supabase.from("leads") as ReturnType<typeof supabase.from>).insert({
      name:    fd.get("name") as string,
      mobile:  fd.get("mobile") as string,
      email:   fd.get("email") as string,
      message: `Plot Loan Enquiry — Budget: ${budget}`,
      status:  "NEW",
    } as never);
    if (err) { setError(err.message); setStatus("idle"); return; }
    setStatus("done");
    formRef.current?.reset();
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Dark gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)" }}
      />
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="text-white">
            <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-accent" />
              Plot Loan Assistance
            </p>
            <h2 className="font-display font-black text-3xl md:text-4xl leading-tight mb-4">
              Get the best plot loan<br />
              <span className="text-accent">tailored for you</span>
            </h2>
            <p className="text-slate-300 leading-relaxed mb-8">
              Our team works with 12+ banks to get you the best plot loan rates.
              Leave your details and we'll call you within 2 hours.
            </p>
            <div className="space-y-3">
              {[
                "Plot loans starting from 8.5% p.a.",
                "Loan up to 75% of plot value",
                "Dedicated plot loan advisor",
                "Free eligibility check — no credit score impact",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl3 border border-white/20 p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl2 bg-accent flex items-center justify-center shrink-0">
                <BadgeIndianRupee className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white">Get Loan Advice</p>
                <p className="text-xs text-slate-300">Free consultation, no hidden charges</p>
              </div>
            </div>

            {status === "done" ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3" />
                <p className="font-display font-bold text-white text-lg">Request received!</p>
                <p className="text-slate-300 text-sm mt-1">Our loan advisor will call you within 2 hours.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-5 text-sm font-semibold text-accent hover:text-accent-300 transition"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  name="name"
                  placeholder="Your Full Name"
                  className="w-full px-4 py-3 rounded-xl2 bg-white/15 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:border-accent focus:outline-none"
                />
                <input
                  required
                  name="mobile"
                  type="tel"
                  pattern="[0-9]{10}"
                  placeholder="Mobile Number (10 digits)"
                  className="w-full px-4 py-3 rounded-xl2 bg-white/15 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:border-accent focus:outline-none"
                />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-xl2 bg-white/15 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:border-accent focus:outline-none"
                />
                <select
                  required
                  name="budget"
                  defaultValue=""
                  className="w-full px-4 py-3 rounded-xl2 bg-white/15 border border-white/20 text-sm focus:border-accent focus:outline-none text-white"
                >
                  <option value="" disabled className="text-slate-800">Select Budget Range</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b} className="text-slate-800">{b}</option>
                  ))}
                </select>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 rounded-xl2 bg-accent text-white font-bold text-sm hover:bg-accent-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {status === "loading" ? "Submitting…" : "Get Free Loan Consultation"}
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  By submitting you agree to be contacted by our team. 100% confidential.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
