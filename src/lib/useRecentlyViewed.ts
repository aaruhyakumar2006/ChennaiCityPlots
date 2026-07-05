import { useState, useEffect } from "react";

const KEY = "pdh_recently_viewed";
const MAX = 6;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  function track(id: string) {
    setIds((prev) => {
      const filtered = prev.filter((x) => x !== id);
      return [id, ...filtered].slice(0, MAX);
    });
  }

  return { ids, track };
}
