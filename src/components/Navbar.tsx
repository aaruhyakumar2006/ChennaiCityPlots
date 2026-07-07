import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home as HomeIcon, Menu, X, Heart, LogOut, UserCircle2, ShieldCheck } from "lucide-react";
import { useWishlist } from "@/lib/useWishlist";
import { useUserAuth } from "@/lib/useUserAuth";
import { isAdminEmail } from "@/App";

const navLinks = [
  { href: "/",          label: "Home" },
  { href: "/properties", label: "Plots" },
  { href: "/why-us",    label: "Why Us" },
  { href: "/contact",   label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { count: wishlistCount } = useWishlist();
  const { user, openGate, signOut } = useUserAuth();
  const isAdmin = isAdminEmail(user?.email);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* ── Desktop / sticky header ── */}
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "bg-white/97 backdrop-blur-md border-line shadow-[0_2px_20px_rgba(10,22,40,0.08)]"
            : "bg-white/95 backdrop-blur border-line"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-xl2 seal flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" strokeWidth={2} />
            </span>
            <span className="font-display font-bold text-lg tracking-tight">
              Madras City <span className="text-accent">Plots</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-ink-700">
            {navLinks.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`px-4 py-2 rounded-xl2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? "bg-accent/8 text-accent font-semibold"
                      : "hover:bg-surface hover:text-accent"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/saved"
              aria-label={`View saved plots (${wishlistCount})`}
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl2 border border-line text-sm font-semibold text-ink-700 hover:border-accent hover:text-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`} /> Saved
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)" }}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
                    <UserCircle2 className="w-4 h-4 text-accent" />
                    {user.user_metadata?.full_name?.split(" ")[0] ?? "Account"}
                  </span>
                )}
                <button
                  onClick={signOut}
                  aria-label="Sign out"
                  className="w-9 h-9 rounded-xl2 border border-line flex items-center justify-center text-muted hover:border-red-400 hover:text-red-500 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openGate()}
                className="px-4 py-2 rounded-xl2 border border-accent text-accent text-sm font-semibold hover:bg-accent hover:text-white transition"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu — outside <header> so sticky z-index doesn't clip the overlay ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[200] flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Slide-over panel */}
          <div className="relative ml-auto w-full max-w-sm bg-navy h-full flex flex-col animate-slideInRight shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl seal flex items-center justify-center">
                  <HomeIcon className="w-4 h-4 text-white" />
                </span>
                <span className="font-display font-bold text-white text-sm">Madras City Plots</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navLinks.map((l) => {
                const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition ${
                      active ? "bg-accent text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="px-4 pb-8 space-y-3 border-t border-white/10 pt-4">
              <Link
                to="/saved"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/15 text-sm font-semibold text-slate-300 hover:bg-white/8 transition"
              >
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${wishlistCount > 0 ? "fill-red-400 text-red-400" : "text-slate-400"}`} />
                  Saved Properties
                </div>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">{wishlistCount}</span>
                )}
              </Link>

              {/* Auth actions */}
              {user ? (
                <div className="space-y-2">
                  {isAdmin && (
                    <button
                      onClick={() => { setOpen(false); navigate("/admin"); }}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #0F5244 0%, #166534 100%)" }}
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => { setOpen(false); signOut(); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/15 text-sm font-semibold text-slate-300 hover:bg-white/8 transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setOpen(false); openGate(); }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-white/20 text-sm font-bold text-white transition hover:bg-white/8"
                >
                  Sign In
                </button>
              )}

              <Link
                to="/properties"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)" }}
              >
                Browse Plots
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
