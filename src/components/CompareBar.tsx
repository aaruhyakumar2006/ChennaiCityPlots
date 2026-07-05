import { Link } from "react-router-dom";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare } from "@/lib/useCompare";

export default function CompareBar() {
  const { items, toggle, clear, count } = useCompare();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeDown">
      <div className="flex items-center gap-3 bg-ink text-white rounded-xl2 shadow-cardHover px-5 py-3 border border-white/10">
        <GitCompareArrows className="w-4 h-4 text-accent shrink-0" />
        <span className="text-sm font-medium shrink-0">{count} / 3 selected</span>
        <div className="flex gap-2">
          {items.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1.5 bg-white/10 rounded-full pl-3 pr-1.5 py-1 text-xs font-medium"
            >
              {p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name}
              <button
                onClick={() => toggle(p)}
                aria-label={`Remove ${p.name} from comparison`}
                className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-1">
          {count >= 2 && (
            <Link
              to="/compare"
              className="px-4 py-1.5 rounded-xl2 bg-accent text-white text-xs font-semibold hover:bg-accent-700 transition"
            >
              Compare
            </Link>
          )}
          <button
            onClick={clear}
            aria-label="Clear comparison"
            className="text-xs text-white/50 hover:text-white transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
