import { useState, useEffect } from "react";
import type { PropertyCardData } from "@/types";

const KEY = "pdh_compare";
const MAX = 3;

export function useCompare() {
  const [items, setItems] = useState<PropertyCardData[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  function toggle(property: PropertyCardData) {
    setItems((prev) => {
      if (prev.find((p) => p.id === property.id)) return prev.filter((p) => p.id !== property.id);
      if (prev.length >= MAX) return prev;
      return [...prev, property];
    });
  }

  function isComparing(id: string) { return items.some((p) => p.id === id); }
  function clear() { setItems([]); }

  return { items, toggle, isComparing, clear, count: items.length, canAdd: items.length < MAX };
}
