import { useState, useEffect } from "react";

const KEY = "pdh_wishlist";

export function useWishlist() {
  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(saved));
  }, [saved]);

  function toggle(id: string) {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function isSaved(id: string) {
    return saved.includes(id);
  }

  return { saved, toggle, isSaved, count: saved.length };
}
