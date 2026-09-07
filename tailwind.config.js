/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#06070c",
          900: "#0a0c14",
          800: "#11141f",
          700: "#1a1e2c",
        },
        accent: {
          DEFAULT: "#5b6bff",
          soft: "#8b96ff",
          glow: "#3946c9",
        },
        cyan: {
          signal: "#3fe0d0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.45)",
        glow: "0 0 40px rgba(91,107,255,0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
