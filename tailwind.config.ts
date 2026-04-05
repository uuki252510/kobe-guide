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
        "kobe-gold":  "#C9A44C",
        "kobe-amber": "#E8C46A",
        "kobe-red":   "#C0392B",
        "kobe-cream": "#FFF8EC",

        // ── Linear Design System (DESIGN.md) ─────────────────
        ln: {
          // Backgrounds (darkest → lightest surface)
          "bg":      "#0f1011",   // panel / page background
          "bg-deep": "#08090a",   // deepest marketing black
          "s1":      "#191a1b",   // surface level 1 (cards)
          "s2":      "#28282c",   // surface level 2 (hover / elevated)
          // Text
          "t1":      "#f7f8f8",   // primary text
          "t2":      "#d0d6e0",   // secondary text
          "t3":      "#8a8f98",   // muted / placeholder
          "t4":      "#62666d",   // subtle / timestamp
          // Accent (brand indigo-violet)
          "accent":  "#5e6ad2",   // CTA background
          "violet":  "#7170ff",   // interactive / active
          "violet-h":"#828fff",   // hover
          // Status
          "green":   "#27a644",
          "emerald": "#10b981",
          // Borders (solid)
          "b1":      "#23252a",
          "b2":      "#34343a",
          "b3":      "#3e3e44",
        },
      },
      fontFamily: {
        sans: [
          "Inter Variable", "Inter",
          "SF Pro Display", "-apple-system", "system-ui",
          "Segoe UI", "Helvetica Neue", "sans-serif",
        ],
      },
      boxShadow: {
        "card":     "0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.04)",
        "card-md":  "0 2px 12px rgba(0,0,0,0.09), 0 0 1px rgba(0,0,0,0.04)",
        "nav-top":  "0 -1px 8px rgba(0,0,0,0.06)",
        "nav-bottom":"0 1px 8px rgba(0,0,0,0.06)",
        // Linear shadow tokens
        "ln-card":  "0 0 0 1px rgba(0,0,0,0.2)",
        "ln-float": "0 2px 4px rgba(0,0,0,0.4)",
        "ln-focus":  "0 4px 12px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        "ln-sm":   "4px",
        "ln":      "6px",
        "ln-card": "8px",
        "ln-panel":"12px",
        "ln-pill": "9999px",
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
