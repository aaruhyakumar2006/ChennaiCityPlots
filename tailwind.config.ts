import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#F4F6FB",
        accent: {
          DEFAULT: "#0F5244",   // sophisticated pine/emerald green
          50:  "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          400: "#34D399",
          500: "#10B981",       // vibrant emerald
          600: "#0F5244",       // primary dark emerald
          700: "#064E3B",
          900: "#022C22",
        },
        gold: {
          DEFAULT: "#D4AF37",   // refined champagne gold
          50:  "#FAF8F0",
          100: "#F5ECD2",
          400: "#E5C158",
          500: "#D4AF37",
          600: "#B89025",
        },
        ink: {
          DEFAULT: "#0D1117",
          700: "#1F2937",
          600: "#374151",
        },
        muted: "#64748B",
        ok:   "#059669",
        line: "#E2E8F0",
        navy: "#0B1210",        // very dark pine charcoal
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body:    ["Inter",   "sans-serif"],
      },
      borderRadius: {
        xl2: "14px",
        xl3: "20px",
      },
      boxShadow: {
        card:     "0 1px 3px rgba(10,22,40,0.06), 0 1px 2px rgba(10,22,40,0.04)",
        cardHover:"0 20px 48px -12px rgba(15,82,68,0.22)",
        soft:     "0 8px 32px rgba(10,22,40,0.08)",
        glow:     "0 0 40px rgba(15,82,68,0.35)",
        "glow-gold": "0 0 32px rgba(212,175,55,0.4)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #050E0C 0%, #0A1412 40%, #0F2621 70%, #050E0C 100%)",
        "accent-gradient": "linear-gradient(135deg, #0F5244 0%, #166534 100%)",
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #E5C158 100%)",
        "card-gradient": "linear-gradient(145deg, #FFFFFF 0%, #F4F6FB 100%)",
      },
      animation: {
        "aurora": "aurora 8s ease infinite alternate",
        "float":  "floatY 6s ease-in-out infinite",
        "float2": "floatY 8s ease-in-out 1s infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        aurora: {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
