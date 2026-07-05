import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import CompareBar from "@/components/CompareBar";
import AuthGateModal from "@/components/AuthGateModal";
import { useUserAuth } from "@/lib/useUserAuth";
import { usePageContext } from "@/lib/usePageContext";

const GATE_KEY = "pdh_gate_shown";

export default function SiteLayout() {
  const { user, loading, showGate, openGate } = useUserAuth();
  const { propertyName } = usePageContext();

  // Show gate to first-time visitors after 3 seconds
  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (sessionStorage.getItem(GATE_KEY)) return;

    const t = setTimeout(() => {
      sessionStorage.setItem(GATE_KEY, "1");
      openGate("Sign up free to view properties, save listings and book site visits.");
    }, 3000);

    return () => clearTimeout(t);
  }, [loading, user]);

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab propertyName={propertyName} />
      <CompareBar />
      {showGate && <AuthGateModal />}
    </>
  );
}
