/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          600: "#0D6E6E",
          700: "#0a5a5a",
        },
      },
    },
  },
  plugins: [],
};
