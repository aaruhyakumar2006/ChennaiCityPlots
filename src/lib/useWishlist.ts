/**
 * useWishlist
 *
 * - Logged-out users: saved plot IDs are kept in localStorage (KEY below).
 * - Logged-in users:  IDs are synced to the `user_wishlist` Supabase table.
 *   On sign-in, any locally saved IDs are merged into the cloud list so
 *   nothing is lost.
 *
 * NOTE: the `user_wishlist` table must exist in Supabase.
 * Run prisma/migrations/add_user_wishlist.sql in the Supabase SQL Editor first.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const LOCAL_KEY = "pdh_wishlist";

function getLocal(): string[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]"); }
  catch { return []; }
}
function setLocal(ids: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
}

export function useWishlist() {
  const [saved, setSaved]   = useState<string[]>(getLocal);
  const [userId, setUserId] = useState<string | null>(null);
  const mergedRef           = useRef(false); // prevent double-merge on StrictMode

  // ── Track auth state ────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ── When user logs in: load cloud list and merge local into it ──────────
  useEffect(() => {
    if (!userId) {
      mergedRef.current = false;
      return;
    }

    (async () => {
      // 1. Fetch cloud wishlist
      const { data } = await (supabase as any)
        .from("user_wishlist")
        .select("property_id")
        .eq("user_id", userId);

      const cloudIds: string[] = (data ?? []).map((r: { property_id: string }) => r.property_id);

      // 2. Merge local IDs that aren't in the cloud yet (one-time on login)
      if (!mergedRef.current) {
        mergedRef.current = true;
        const localIds = getLocal();
        const toAdd = localIds.filter((id) => !cloudIds.includes(id));
        if (toAdd.length > 0) {
          await (supabase as any).from("user_wishlist").insert(
            toAdd.map((property_id) => ({ user_id: userId, property_id }))
          );
          cloudIds.push(...toAdd);
        }
        setLocal([]); // clear local after merge
      }

      setSaved(cloudIds);
    })();
  }, [userId]);

  // ── Persist locally when logged out ────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setLocal(saved);
    }
  }, [saved, userId]);

  // ── Toggle ──────────────────────────────────────────────────────────────
  const toggle = useCallback(async (propertyId: string) => {
    const alreadySaved = saved.includes(propertyId);

    // Optimistic update
    setSaved((prev) =>
      alreadySaved ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );

    if (userId) {
      if (alreadySaved) {
        await (supabase as any)
          .from("user_wishlist")
          .delete()
          .eq("user_id", userId)
          .eq("property_id", propertyId);
      } else {
        await (supabase as any)
          .from("user_wishlist")
          .insert({ user_id: userId, property_id: propertyId });
      }
    }
  }, [saved, userId]);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved, count: saved.length };
}
