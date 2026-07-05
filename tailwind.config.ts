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
          DEFAULT: "#1A3FA8",   // deep royal blue
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          400: "#818CF8",
          500: "#2952D6",
          600: "#1A3FA8",
          700: "#153490",
          900: "#0E2266",
        },
        gold: {
          DEFAULT: "#F59E0B",
          50:  "#FFFBEB",
          100: "#FEF3C7",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        ink: {
          DEFAULT: "#0D1117",
          700: "#1F2937",
          600: "#374151",
        },
        muted: "#64748B",
        ok:   "#059669",
        line: "#E2E8F0",
        navy: "#0A1628",
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
        cardHover:"0 20px 48px -12px rgba(26,63,168,0.22)",
        soft:     "0 8px 32px rgba(10,22,40,0.08)",
        glow:     "0 0 40px rgba(26,63,168,0.35)",
        "glow-gold": "0 0 32px rgba(245,158,11,0.4)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #050C1A 0%, #0A1628 40%, #0D1F45 70%, #050C1A 100%)",
        "accent-gradient": "linear-gradient(135deg, #1A3FA8 0%, #2952D6 100%)",
        "gold-gradient": "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
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
