import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home as HomeIcon, LayoutDashboard, Building2, Users, CalendarDays, LogOut, MessageSquareQuote, HardHat } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/leads", label: "Leads", icon: Users, badge: true },
  { href: "/admin/visits", label: "Site Visits", icon: CalendarDays },
  { href: "/admin/testimonials", label: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/builders", label: "Builders", icon: HardHat },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [newLeads, setNewLeads] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel("admin-new-leads")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, () =>
        setNewLeads((n) => n + 1)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 shrink-0 bg-ink text-gray-300 flex-col">
        <div className="px-6 h-16 flex items-center gap-2 border-b border-white/10">
          <span className="w-8 h-8 rounded-xl2 seal flex items-center justify-center">
            <HomeIcon className="w-4 h-4 text-white" />
          </span>
          <span className="font-display font-semibold text-white text-sm leading-tight">
            Chennai City Plots
            <br />
            <span className="text-[11px] text-gray-400 font-normal">Admin Dashboard</span>
          </span>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-3">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const showBadge = item.badge && newLeads > 0;
            if (active && item.badge && newLeads > 0) setNewLeads(0);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-accent text-white shadow-sm"
                    : "text-gray-400 hover:bg-white/8 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {showBadge && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {newLeads}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 mb-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/8 hover:text-white transition-all"
          >
            <HomeIcon className="w-4 h-4 shrink-0" />
            View Website
          </a>
        </div>
        <button
          onClick={logout}
          className="m-3 px-4 py-2.5 rounded-xl2 border border-white/15 text-sm font-medium text-gray-300 hover:bg-white/5 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-line flex items-center justify-between px-5 md:px-8 sticky top-0 z-20">
          <h1 className="font-display font-semibold text-lg capitalize">
            {NAV.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)))?.label ?? "Admin"}
          </h1>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted hover:text-accent">
              View Site
            </Link>
            <span className="w-9 h-9 rounded-full bg-accent-50 text-accent font-display font-semibold flex items-center justify-center text-sm">
              SA
            </span>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-line flex">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const showBadge = item.badge && newLeads > 0;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-semibold transition ${
                  active ? "text-accent" : "text-muted hover:text-ink"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-accent" : "text-muted"}`} />
                {item.label}
                {showBadge && (
                  <span className="absolute top-1.5 right-[calc(50%-18px)] w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {newLeads}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Spacer so content doesn't hide behind bottom nav on mobile */}
        <div className="md:hidden h-16" />

        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

