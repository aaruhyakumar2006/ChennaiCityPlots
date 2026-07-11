import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UserAuthContextValue {
  user: User | null;
  loading: boolean;
  showGate: boolean;
  openGate: (reason?: string) => void;
  closeGate: () => void;
  gateReason: string;
  signOut: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextValue>({
  user: null,
  loading: true,
  showGate: false,
  openGate: () => {},
  closeGate: () => {},
  gateReason: "",
  signOut: async () => {},
});

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showGate, setShowGate]   = useState(false);
  const [gateReason, setGateReason] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setShowGate(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function openGate(reason = "") {
    setGateReason(reason);
    setShowGate(true);
  }
  function closeGate() { setShowGate(false); }
  
  async function signOut() {
    if (!user) return;
    
    try {
      // Save session data to user profile before logout
      await supabase
        .from("user_profile")
        .upsert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || null,
          mobile: user.user_metadata?.mobile || null,
          last_logout: new Date().toISOString(),
          session_data: {
            last_viewed_properties: [],
            preferences: {}
          },
          updated_at: new Date().toISOString(),
        } as any, {
          onConflict: "id"
        });
    } catch (err) {
      console.error("Failed to save session data:", err);
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <UserAuthContext.Provider value={{ user, loading, showGate, openGate, closeGate, gateReason, signOut }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}
