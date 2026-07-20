/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#fdf2f4", 100: "#fce4e8", 200: "#f9c9d3", 300: "#f49bae", 400: "#ec6480", 500: "#dc3d5f", 600: "#c82748", 700: "#a51d3c", 800: "#881c38", 900: "#731e36", 950: "#410917" },
        secondary: { 50: "#fdfaef", 100: "#f8edc9", 200: "#f0d98e", 300: "#e8c25a", 400: "#e0a832", 500: "#d68a14", 600: "#b86a0c", 700: "#934d0d", 800: "#783d12", 900: "#633314", 950: "#381a07" },
      },
      fontFamily: { display: ["var(--font-display)", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
