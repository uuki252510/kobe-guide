import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm neutral scale — light theme
        // 50 = lightest (page bg) → 950 = near-black
        harbor: {
          50:  "#FAFAF7",  // page background
          100: "#F4EDE6",  // card / panel surface
          200: "#EBE3D8",  // border light
          300: "#D8D0C4",  // border normal
          400: "#B0A89E",  // disabled / placeholder
          500: "#857E78",  // muted text
          600: "#5C5752",  // secondary text
          700: "#3D3832",  // body text
          800: "#262220",  // heading
          900: "#161412",  // strong heading
          950: "#0C0A09",  // near black
        },
        // Kobe brand accent
        "kobe-gold":  "#C9A44C",  // primary CTA, gold text
        "kobe-amber": "#E8C46A",  // hover / lighter accent
        "kobe-red":   "#C0392B",  // alerts, badges
        "kobe-cream": "#FFF8EC",  // warm off-white tint
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "sans-serif"],
      },
      boxShadow: {
        "card":   "0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.04)",
        "card-md":"0 2px 12px rgba(0,0,0,0.09), 0 0 1px rgba(0,0,0,0.04)",
        "nav-top":"0 -1px 8px rgba(0,0,0,0.06)",
        "nav-bottom":"0 1px 8px rgba(0,0,0,0.06)",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-in-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
