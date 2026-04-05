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

        // ── Apple Design System (DESIGN.md) ──────────────────
        ap: {
          // Backgrounds
          black:       "#000000",   // hero / dark sections
          "near-black":"#1d1d1f",   // near-black text / dark section bg
          gray:        "#f5f5f7",   // light section bg
          // Dark surfaces
          "dark-1":    "#272729",
          "dark-2":    "#262628",
          "dark-3":    "#28282a",
          "dark-4":    "#2a2a2d",
          "dark-5":    "#242426",
          // Interactive
          blue:        "#0071e3",   // primary CTA — ONLY accent
          "blue-link": "#0066cc",   // links on light bg
          "blue-dark": "#2997ff",   // links on dark bg
          // Button states
          "btn-active":"#ededf2",
          "btn-light":  "#fafafc",
        },
      },
      fontFamily: {
        sans:    ["Inter", "Noto Sans JP", "sans-serif"],
        // Apple typeface — SF Pro uses system font stack on Apple, Helvetica elsewhere
        display: ["SF Pro Display", "SF Pro Icons", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        body:    ["SF Pro Text",    "SF Pro Icons", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      letterSpacing: {
        // Apple's signature tight tracking values (DESIGN.md)
        "ap-hero":  "-0.28px",
        "ap-body":  "-0.374px",
        "ap-link":  "-0.224px",
        "ap-micro": "-0.12px",
        "ap-nano":  "-0.08px",
      },
      lineHeight: {
        "ap-hero":   "1.07",   // Display Hero
        "ap-section":"1.10",   // Section Heading
        "ap-tile":   "1.14",   // Tile Heading
        "ap-card":   "1.19",   // Card Title
        "ap-body":   "1.47",   // Body
        "ap-btn":    "2.41",   // Button (relaxed)
      },
      boxShadow: {
        "card":     "0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.04)",
        "card-md":  "0 2px 12px rgba(0,0,0,0.09), 0 0 1px rgba(0,0,0,0.04)",
        "nav-top":  "0 -1px 8px rgba(0,0,0,0.06)",
        "nav-bottom":"0 1px 8px rgba(0,0,0,0.06)",
        // Apple product card shadow
        "ap-card":  "3px 5px 30px 0px rgba(0,0,0,0.22)",
      },
      borderRadius: {
        // Apple radius scale
        "ap-sm":   "5px",
        "ap":      "8px",
        "ap-input":"11px",
        "ap-lg":   "12px",
        "ap-pill": "980px",
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
