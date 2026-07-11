import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/App";
import { isAdminUser } from "@/lib/adminAuth";
import { Helmet } from "react-helmet-async";
import { Home as HomeIcon, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, X, User, Phone } from "lucide-react";

// ── Forgot Password inline panel ─────────────────────────────────────────────
function ForgotPassword({ email }: { email: string }) {
  const [open, setOpen]     = useState(false);
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState(email);

  async function send() {
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    setSent(true);
  }

  if (!open) return (
    <p className="text-center">
      <button type="button" onClick={() => setOpen(true)}
        className="text-xs text-muted hover:text-accent transition">
        Forgot password?
      </button>
    </p>
  );

  return (
    <div className="bg-slate-50 rounded-xl border border-line p-4 space-y-3">
      <p className="text-xs font-semibold text-ink">Reset your password</p>
      {sent ? (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✓ Check your email for a reset link.
        </p>
      ) : (
        <>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:border-accent focus:outline-none"
          />
          <button type="button" onClick={send} disabled={loading}
            className="w-full py-2 rounded-lg bg-accent text-white text-xs font-semibold disabled:opacity-60">
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </>
      )}
      <button type="button" onClick={() => setOpen(false)}
        className="text-[11px] text-muted hover:text-accent transition">
        Cancel
      </button>
    </div>
  );
}

// ── Sign Up panel ─────────────────────────────────────────────────────────────
function SignupPanel({ onClose }: { onClose: () => void }) {
  const [step, setStep]        = useState<"email" | "otp">("email");
  const [name, setName]        = useState("");
  const [mobile, setMobile]    = useState("");
  const [email, setEmail]      = useState("");
  const [otp, setOtp]          = useState("");
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState("");

  async function sendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        data: { full_name: name, mobile }
      }
    });
    
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep("otp");
  }

  async function verifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp,
      type: 'email'
    });
    
    setLoading(false);
    if (err) { setError(err.message); return; }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink transition">
          <X className="w-4 h-4" />
        </button>
        
        {step === "email" ? (
          <>
            <h2 className="font-display font-bold text-lg mb-1">Create Account</h2>
            <p className="text-sm text-muted mb-5">Save plots, book visits, track enquiries</p>
            <form onSubmit={sendOTP} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name" autoComplete="name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input required value={mobile} onChange={(e) => setMobile(e.target.value)}
                    placeholder="Mobile" type="tel" pattern="[6-9][0-9]{9}"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none" />
                </div>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" type="email" autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none" />
              </div>
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠ {error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</> : "Send OTP"}
              </button>
              <p className="text-[11px] text-slate-400 text-center">🔒 Your details are 100% confidential</p>
            </form>
          </>
        ) : (
          <>
            <h2 className="font-display font-bold text-lg mb-1">Verify Email</h2>
            <p className="text-sm text-muted mb-5">Enter the OTP sent to <strong>{email}</strong></p>
            <form onSubmit={verifyOTP} className="space-y-3">
              <div className="relative">
                <input required value={otp} onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP" maxLength={6}
                  className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-center font-mono focus:border-accent focus:outline-none" />
              </div>
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠ {error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify OTP"}
              </button>
              <button type="button" onClick={() => setStep("email")}
                className="w-full py-2 text-sm text-accent hover:underline">
                Back to email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isAdmin, loading } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // "from" lets us send users back where they came from after login
  const from: string = (location.state as { from?: string })?.from ?? "/";

  // If already logged in, redirect immediately
  useEffect(() => {
    if (loading) return;
    if (!session) return;
    if (isAdmin) {
      navigate("/admin", { replace: true });
    } else {
      navigate(from === "/login" ? "/" : from, { replace: true });
    }
  }, [session, isAdmin, loading, navigate, from]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(authError.message || "Sign in failed. Please check your credentials.");
      setSubmitting(false);
      return;
    }

    // Check if user is admin
    const adminStatus = await isAdminUser(data.session?.user.email);
    
    // Route based on role
    if (adminStatus) {
      navigate("/admin", { replace: true });
    } else {
      navigate(from === "/login" ? "/" : from, { replace: true });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign In | Madras City Plots</title>
        <meta name="description" content="Sign in to your Madras City Plots account to access saved properties, enquiries and admin dashboard." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 mx-auto w-fit">
          <span className="w-10 h-10 rounded-xl seal flex items-center justify-center shadow-lg">
            <HomeIcon className="w-5 h-5 text-white" />
          </span>
          <span className="font-display font-bold text-lg text-white">
            Madras City <span className="text-accent">Plots</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-accent" />
            </div>
            <h1 className="font-display font-bold text-xl mb-1 text-ink">Welcome Back</h1>
            <p className="text-sm text-muted">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  required
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                ⚠ {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Forgot password */}
            <ForgotPassword email={email} />
          </form>

          {/* Sign up prompt */}
          <div className="mt-5 pt-5 border-t border-line text-center">
            <p className="text-xs text-muted">
              New here?{" "}
              <button
                type="button"
                onClick={() => setShowSignup(true)}
                className="font-semibold text-accent hover:underline"
              >
                Create a free account
              </button>
            </p>
          </div>

          {showSignup && <SignupPanel onClose={() => setShowSignup(false)} />}

          <p className="text-[11px] text-center text-muted mt-3 leading-relaxed">
            Admin and user accounts use the same login. Users will be directed to the homepage, admins to the dashboard.
          </p>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          <Link to="/" className="hover:text-white transition">← Back to website</Link>
        </p>
      </div>
    </section>
    </>
  );
}
