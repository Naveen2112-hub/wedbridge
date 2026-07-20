/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#fff8f3", 100: "#ffecdc", 200: "#ffd4b0", 300: "#ffb380", 400: "#ff8c4d", 500: "#ff6a1a", 600: "#f54e00", 700: "#cc3f00", 800: "#a83300", 900: "#872a00", 950: "#4a1700" },
        secondary: { 50: "#fdfaef", 100: "#f8edc9", 200: "#f0d98e", 300: "#e8c25a", 400: "#e0a832", 500: "#d68a14", 600: "#b86a0c", 700: "#934d0d", 800: "#783d12", 900: "#633314", 950: "#381a07" },
        ink: "#1a1a1a",
        muted: "#6b7280",
      },
      fontFamily: { display: ["var(--font-display)", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
