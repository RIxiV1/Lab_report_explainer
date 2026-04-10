/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf5f5",
          600: "#0D6E6E",
          700: "#0a5a5a",
          800: "#0a5757",
        },
        cream: "#FAF8F5",
        sand: {
          100: "#f0ebe5",
          200: "#ece8e3",
          300: "#e8e3dd",
          400: "#e0dbd5",
        },
      },
      fontFamily: {
        sans: ["'Manrope'", "sans-serif"],
        serif: ["'Domaine Display'", "Georgia", "serif"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease",
      },
    },
  },
  plugins: [],
};
