/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      full: "9999px",
    },
    extend: {
      colors: {
        // ForMen brand — Marian Blue
        brand: {
          50:  "#DAE1F9",
          100: "#DAE1F9",
          200: "#B7C4F3",
          300: "#8A9BDD",
          400: "#6474BB",
          500: "#36458E",  // base
          600: "#36458E",
          700: "#27347A",
          800: "#1B2566",
          900: "#111852",
          950: "#0A1044",
        },
        // Selective Yellow accent
        yellow: {
          50:  "#FFF6CC",
          100: "#FFF6CC",
          200: "#FFEB99",
          300: "#FFDD66",
          400: "#FFCF3F",
          500: "#FFB800",
          600: "#DB9700",
          700: "#B77900",
          800: "#935D00",
          900: "#7A4A00",
        },
        // Neutrals from brand guide
        neutral: {
          0:   "#ffffff",
          100: "#F4F5F7",
          200: "#DFE1E6",
          300: "#C1C7D0",
          400: "#B3BAC5",
          500: "#7A869A",
          600: "#5E6C84",
          700: "#42526E",
          800: "#172B4D",
          900: "#091E42",
        },
        // Surface hierarchy for tonal layering
        surface:        "#F4FAFB",
        "surface-low":  "#EBF5F7",
        "surface-high": "#DFE1E6",
        cream: "#F4FAFB",
        sand: {
          100: "#EBF5F7",
          200: "#DFE1E6",
          300: "#C1C7D0",
          400: "#B3BAC5",
        },
        // Wellness green for "Normal" status
        wellness: {
          100: "#F1FBEE",
          300: "#C8EAC7",
          500: "#8BB992",
          600: "#659F73",
          800: "#2C6B47",
        },
      },
      fontFamily: {
        sans:  ["'Manrope'", "sans-serif"],
        serif: ["'Domine'", "'Georgia'", "serif"],
      },
      letterSpacing: {
        clinical: "0.15rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease",
      },
    },
  },
  plugins: [],
};
