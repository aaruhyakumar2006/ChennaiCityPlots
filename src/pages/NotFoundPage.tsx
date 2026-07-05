import { Link } from "react-router-dom";
import { Home, ArrowRight, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #050C1A 0%, #0A1628 60%, #0D1F45 100%)" }}>

      {/* Orbs */}
      <div className="absolute w-96 h-96 rounded-full top-[-8rem] left-[-8rem] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(26,63,168,0.3) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute w-80 h-80 rounded-full bottom-[-6rem] right-[-6rem] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative z-10 text-center max-w-xl">

        {/* 404 large number */}
        <div className="relative mb-6 select-none">
          <p className="font-display font-black text-[10rem] md:text-[14rem] leading-none"
            style={{
              background: "linear-gradient(135deg, #1A3FA8 0%, #4F72E8 50%, #6366F1 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", opacity: 0.4,
            }}>
            404
          </p>
          {/* Floating house icon over the 0 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass rounded-3xl p-6 shadow-glow">
              <Home className="w-12 h-12 md:w-16 md:h-16 text-blue-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-3">
          This address doesn't exist
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10 max-w-sm mx-auto">
          Looks like this page has been demolished or never existed. Let's find you a better property.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link to="/"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1A3FA8 0%, #2952D6 100%)", boxShadow: "0 4px 20px rgba(26,63,168,0.4)" }}>
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/properties"
            className="glass flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white hover:bg-white/15 transition">
            <Search className="w-4 h-4 text-blue-400" /> Browse Properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <button onClick={() => window.history.back()}
          className="text-slate-500 text-sm hover:text-slate-300 transition">
          ← Go back
        </button>
      </div>
    </div>
  );
}
