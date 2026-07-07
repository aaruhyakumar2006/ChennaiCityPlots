import { useState, useRef } from "react";
import { X, Home as HomeIcon, Loader2, Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, MapPin, BadgeCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/lib/useUserAuth";

type Mode = "signup" | "login" | "verify_email";

function Field({
  icon: Icon, label, type = "text", value, onChange, required, pattern, minLength, autoComplete,
}: {
  icon: React.ElementType; label: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean; pattern?: string;
  minLength?: number; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type={inputType} value={value} onChange={(e) => onChange(e.target.value)}
          required={required} pattern={pattern} minLength={minLength}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-10 py-3 rounded-xl border-[1.5px] border-slate-200 text-sm text-ink bg-slate-50 focus:bg-white focus:border-accent focus:outline-none transition-all"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// Individual OTP digit boxes
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  function handleChange(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = digits.map((c, idx) => (idx === i ? d : c)).join("").replace(/ /g, "");
    onChange(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); refs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200
            ${ digits[i]?.trim()
              ? "border-accent bg-accent/5 text-accent"
              : "border-slate-200 bg-slate-50 text-ink focus:border-accent focus:bg-white"
            }`}
          style={{ color: digits[i]?.trim() ? undefined : "#0D1117" }}
        />
      ))}
    </div>
  );
}

const PERKS = [
  { icon: ShieldCheck, text: "DTCP & CMDA verified plots" },
  { icon: MapPin,      text: "All major Chennai localities" },
  { icon: BadgeCheck,  text: "Transparent pricing, no hidden fees" },
];

export default function AuthGateModal() {
  const { closeGate, gateReason } = useUserAuth();
  const [mode, setMode]         = useState<Mode>("signup");
  const [name, setName]         = useState("");
  const [mobile, setMobile]     = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  function switchMode(m: Mode) { setMode(m); setError(""); setOtp(""); }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, mobile }, emailRedirectTo: undefined },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setMode("verify_email");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    closeGate();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
    setLoading(false);
    if (err) { setError(err.message); return; }
    closeGate();
  }

  const btnCls = "w-full py-3.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]";
  const btnStyle = { background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)", boxShadow: "0 4px 20px rgba(15,82,68,0.35)" };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[820px] relative animate-fadeDown overflow-hidden flex">

        {/* ── Left panel — hidden on mobile ── */}
        <div className="hidden md:flex flex-col justify-between w-[340px] shrink-0 p-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0A1530 0%, #1D4ED8 60%, #1E3A8A 100%)" }}>

          {/* Background orbs */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-10">
              <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </span>
              <span className="font-display font-bold text-base">Madras City Plots</span>
            </div>

            <h3 className="font-display font-bold text-2xl leading-snug mb-3">
              {mode === "verify_email"
                ? "One last step!"
                : mode === "login"
                ? "Good to see you again"
                : "Find your perfect plot in Chennai"}
            </h3>
            <p className="text-emerald-200/80 text-sm leading-relaxed mb-8">
              {mode === "verify_email"
                ? "Enter the 6-digit code we sent to your email to complete your registration."
                : mode === "login"
                ? "Sign in to access your saved properties and enquiries."
                : "Join thousands of families who found their dream plot through us."}
            </p>

            <div className="space-y-4">
              {PERKS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-300" />
                  </div>
                  <p className="text-sm text-emerald-100/90">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-[11px] text-emerald-300/50 mt-8">
            © {new Date().getFullYear()} Madras City Plots
          </p>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex flex-col min-h-0">

          {/* Close button */}
          <div className="flex justify-end p-4 pb-0">
            <button onClick={closeGate} aria-label="Close"
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 px-7 md:px-10 pb-8 pt-2 overflow-y-auto">

            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-xl seal flex items-center justify-center">
                <HomeIcon className="w-4 h-4 text-white" />
              </span>
              <span className="font-display font-bold text-sm">Madras City Plots</span>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h2 className="font-display font-bold text-xl text-ink mb-1">
                {mode === "verify_email" ? "Verify your email"
                  : mode === "login" ? "Welcome back"
                  : "Create your account"}
              </h2>
              <p className="text-sm text-muted">
                {gateReason || (mode === "signup"
                  ? "Free account · Save plots · Get callbacks"
                  : mode === "login" ? "Sign in to continue"
                  : <span>Code sent to <span className="font-semibold text-ink">{email}</span></span>)}
              </p>
            </div>

            {/* Tab switcher — signup / login */}
            {mode !== "verify_email" && (
              <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                {(["signup", "login"] as Mode[]).map((m) => (
                  <button key={m} type="button" onClick={() => switchMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      mode === m
                        ? "bg-white text-accent shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {m === "signup" ? "Sign Up" : "Sign In"}
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <span className="mt-0.5">⚠</span> {error}
              </div>
            )}

            {/* Sign Up form */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field icon={User}  label="Full Name"   value={name}   onChange={setName}   required autoComplete="name" />
                  <Field icon={Phone} label="Mobile"      value={mobile} onChange={setMobile} required type="tel" pattern="[0-9]{10}" autoComplete="tel" />
                </div>
                <Field icon={Mail} label="Email Address" value={email}    onChange={setEmail}    required type="email" autoComplete="email" />
                <Field icon={Lock} label="Password (min 6 chars)" value={password} onChange={setPassword} required type="password" minLength={6} autoComplete="new-password" />
                <button type="submit" disabled={loading} className={btnCls} style={btnStyle}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create Free Account →"}
                </button>
                <p className="text-[11px] text-slate-400 text-center pt-1">
                  🔒 Your details are 100% confidential
                </p>
              </form>
            )}

            {/* Login form */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-3">
                <Field icon={Mail} label="Email Address" value={email}    onChange={setEmail}    required type="email" autoComplete="email" />
                <Field icon={Lock} label="Password"      value={password} onChange={setPassword} required type="password" autoComplete="current-password" />
                <button type="submit" disabled={loading} className={btnCls} style={btnStyle}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign In →"}
                </button>
              </form>
            )}

            {/* OTP verify */}
            {mode === "verify_email" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <OtpInput value={otp} onChange={setOtp} />
                <button type="submit" disabled={loading || otp.length < 6} className={btnCls} style={btnStyle}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify & Continue →"}
                </button>
                <p className="text-center text-xs text-muted">
                  Wrong email?{" "}
                  <button type="button" onClick={() => switchMode("signup")}
                    className="font-semibold text-accent hover:underline">← Go back</button>
                </p>
              </form>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400 pb-5 px-8">
            By continuing you agree to our Terms of Service &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
