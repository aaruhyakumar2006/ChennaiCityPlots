import { Suspense, lazy, createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserAuthProvider } from "@/lib/useUserAuth";
import { PageContextProvider } from "@/lib/usePageContext";

// Site pages — eagerly loaded (above the fold)
import SiteLayout from "@/layouts/SiteLayout";
import HomePage from "@/pages/HomePage";

// Lazy-loaded public pages
const PropertiesPage     = lazy(() => import("@/pages/PropertiesPage"));
const PropertyDetailPage = lazy(() => import("@/pages/PropertyDetailPage"));
const ComparePage        = lazy(() => import("@/pages/ComparePage"));
const SavedPage          = lazy(() => import("@/pages/SavedPage"));
const LocalityPage       = lazy(() => import("@/pages/LocalityPage"));
const NotFoundPage       = lazy(() => import("@/pages/NotFoundPage"));

// Admin pages — all lazy
const AdminLayout        = lazy(() => import("@/layouts/AdminLayout"));
const LoginPage          = lazy(() => import("@/pages/admin/LoginPage"));
const AdminDashboard     = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminLeadsPage     = lazy(() => import("@/pages/admin/AdminLeadsPage"));
const AdminPropertiesPage = lazy(() => import("@/pages/admin/AdminPropertiesPage"));
const AdminVisitsPage    = lazy(() => import("@/pages/admin/AdminVisitsPage"));
const AdminTestimonialsPage = lazy(() => import("@/pages/admin/AdminTestimonialsPage"));
const AdminBuildersPage  = lazy(() => import("@/pages/admin/AdminBuildersPage"));
const BuilderProfilePage = lazy(() => import("@/pages/BuilderProfilePage"));
const WhyUsPage          = lazy(() => import("@/pages/WhyUsPage"));
const ContactPage        = lazy(() => import("@/pages/ContactPage"));

// ── Auth context ────────────────────────────────────────────────────────────
interface AuthContextValue {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Page skeleton fallback ───────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    </div>
  );
}

// ── Protected route guard ───────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!session) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
      <PageContextProvider>
      <BrowserRouter>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            {/* Public site routes */}
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/location/:area" element={<LocalityPage />} />
              <Route path="/properties/:slug" element={<PropertyDetailPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/builders/:slug" element={<BuilderProfilePage />} />
              <Route path="/why-us" element={<WhyUsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeadsPage />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="visits" element={<AdminVisitsPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
              <Route path="builders" element={<AdminBuildersPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<SiteLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      </PageContextProvider>
      </UserAuthProvider>
    </AuthProvider>
  );
}
