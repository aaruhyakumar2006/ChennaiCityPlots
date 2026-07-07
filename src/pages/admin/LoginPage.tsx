import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";
import { useAuth, isAdminEmail } from "@/App";
import { useEffect } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && session) navigate("/admin", { replace: true });
  }, [session, loading, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as {
      email: string;
      password: string;
    };

    if (!isAdminEmail(data.email)) {
      setError("Access denied. This account is not authorised as admin.");
      setSubmitting(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message || "Sign in failed");
      setSubmitting(false);
      return;
    }

    navigate("/admin");
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-ink to-slate-900 flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 mb-10 mx-auto w-fit">
          <span className="w-10 h-10 rounded-xl seal flex items-center justify-center shadow-lg">
            <HomeIcon className="w-5 h-5 text-white" />
          </span>
          <span className="font-display font-bold text-lg text-white">
            madrascityplots <span className="text-accent">Homes</span>
          </span>
        </Link>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto mb-4">
              <HomeIcon className="w-7 h-7 text-accent" />
            </div>
            <h1 className="font-display font-bold text-xl mb-1">Admin Sign In</h1>
            <p className="text-sm text-muted">Secure access to your dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Email</label>
              <input
                required
                name="email"
                type="email"
                placeholder="admin@madrascityplotshomes.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Password</label>
              <input
                required
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-accent focus:outline-none"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="text-xs text-center text-muted mt-5 bg-surface rounded-xl py-2.5 px-3">
            Create an admin user in Supabase → Authentication → Users
          </p>
        </div>
        <p className="text-center text-white/40 text-xs mt-6">
          <Link to="/" className="hover:text-white transition">← Back to website</Link>
        </p>
      </div>
    </section>
  );
}

