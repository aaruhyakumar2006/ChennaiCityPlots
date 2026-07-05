import { useState } from "react";
import { X, Home as HomeIcon, Loader2, Mail, Lock, User, Phone, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/lib/useUserAuth";

type Mode = "signup" | "login" | "otp_sent";

function FloatField({
  icon: Icon, label, type = "text", value, onChange, required, pattern, minLength, autoComplete,
}: {
  icon: React.ElementType; label: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean; pattern?: string; minLength?: number; autoComplete?: string;
}) {
  return (
    <div className="input-float-group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} pattern={pattern} minLength={minLength}
        autoComplete={autoComplete} placeholder=" "
        className="input-float pl-10"
      />
      <label className="input-float-label pl-10">{label}</label>
    </div>
  );
}

export default function AuthGateModal() {
  const { closeGate, gateReason } = useUserAuth();
  const [mode, setMode]       = useState<Mode>("signup");
  const [name, setName]       = useState("");
  const [mobile, setMobile]   = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name, mobile } },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setInfo("Check your email to confirm, then sign in."); setMode("login");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    closeGate();
  }

  async function handleOtpRequest(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setMode("otp_sent");
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setLoading(false);
    if (err) { setError(err.message); return; }
    closeGate();
  }

  const btnCls = "w-full py-3.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2 transition hover:opacity-90";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fadeDown overflow-hidden">

        {/* Top gradient strip */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #1A3FA8, #6366F1, #F59E0B)" }} />

        {/* Close */}
        {mode === "login" && (
          <button onClick={closeGate} aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center z-10">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}

        {/* Header */}
        <div className="px-8 pt-7 pb-5 text-center">
          <div className="w-14 h-14 rounded-2xl seal flex items-center justify-center mx-auto mb-4 shadow-glow">
            <HomeIcon className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display font-bold text-xl mb-1">
            {mode === "otp_sent" ? "Enter your code"
              : mode === "login" ? "Welcome back"
              : "Join Chennai City Plots"}
          </h2>
          <p className="text-sm text-muted">
            {gateReason || (mode === "signup"
              ? "Create a free account to save properties & enquire"
              : mode === "login" ? "Sign in to continue"
              : `We sent a 6-digit code to ${email}`)}
          </p>
        </div>

        {/* Trust badges — signup only */}
        {mode === "signup" && (
          <div className="flex justify-center gap-3 px-8 mb-5">
            {["Free Account", "No Spam", "Trusted Platform"].map((b) => (
              <span key={b} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">
                <Star className="w-2.5 h-2.5 text-gold-500 fill-gold-500" /> {b}
              </span>
            ))}
          </div>
        )}

        <div className="px-8 pb-7">
          {info && <p className="text-sm text-ok bg-ok/10 border border-ok/20 rounded-xl px-4 py-2.5 mb-4">{info}</p>}
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">{error}</p>}

          {/* Sign Up */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <FloatField icon={User}  label="Full Name"     value={name}     onChange={setName}     required autoComplete="name" />
              <FloatField icon={Phone} label="Mobile Number" value={mobile}   onChange={setMobile}   required type="tel" pattern="[0-9]{10}" autoComplete="tel" />
              <FloatField icon={Mail}  label="Email Address" value={email}    onChange={setEmail}    required type="email" autoComplete="email" />
              <FloatField icon={Lock}  label="Password (min 6 chars)" value={password} onChange={setPassword} required type="password" minLength={6} autoComplete="new-password" />
              <button type="submit" disabled={loading} className={btnCls}
                style={{ background: "linear-gradient(135deg, #1A3FA8 0%, #2952D6 100%)", boxShadow: "0 4px 16px rgba(26,63,168,0.35)" }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Creating account…" : "Create Free Account"}
              </button>
              <p className="text-center text-xs text-muted pt-1">
                Already have an account?{" "}
                <button type="button" onClick={() => { setMode("login"); setError(""); }}
                  className="font-semibold text-accent hover:underline">Sign in</button>
              </p>
            </form>
          )}

          {/* Login */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <FloatField icon={Mail} label="Email Address" value={email}    onChange={setEmail}    required type="email" autoComplete="email" />
              <FloatField icon={Lock} label="Password"      value={password} onChange={setPassword} required type="password" autoComplete="current-password" />
              <button type="submit" disabled={loading} className={btnCls}
                style={{ background: "linear-gradient(135deg, #1A3FA8 0%, #2952D6 100%)", boxShadow: "0 4px 16px rgba(26,63,168,0.35)" }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <p className="text-center text-xs text-muted pt-1">
                New here?{" "}
                <button type="button" onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
                  className="font-semibold text-accent hover:underline">Create account</button>
              </p>
            </form>
          )}

          {/* OTP */}
          {mode === "otp_sent" && (
            <form onSubmit={handleOtpVerify} className="space-y-3">
              <input required value={otp} onChange={(e) => setOtp(e.target.value)}
                placeholder="000000" maxLength={6}
                className="w-full text-center tracking-[0.5em] font-bold text-2xl py-4 rounded-xl border-[1.5px] border-line focus:border-accent focus:outline-none bg-slate-50"
              />
              <button type="submit" disabled={loading} className={btnCls}
                style={{ background: "linear-gradient(135deg, #1A3FA8 0%, #2952D6 100%)" }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Verifying…" : "Verify & Continue"}
              </button>
              <p className="text-center text-xs text-muted">
                <button type="button" onClick={() => setMode("signup")} className="font-semibold text-accent hover:underline">← Back</button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 pb-5 px-8">
          By continuing you agree to our Terms of Service &amp; Privacy Policy.
        </p>
      </div>
    </div>
  );
}

