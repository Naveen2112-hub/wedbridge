/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#fdf2f4", 100: "#fce4e8", 200: "#f9c9d3", 300: "#f49bae", 400: "#ec6480", 500: "#dc3d5f", 600: "#c82748", 700: "#a51d3c", 800: "#881c38", 900: "#731e36", 950: "#410917" },
        secondary: { 50: "#fdfaef", 100: "#f8edc9", 200: "#f0d98e", 300: "#e8c25a", 400: "#e0a832", 500: "#d68a14", 600: "#b86a0c", 700: "#934d0d", 800: "#783d12", 900: "#633314", 950: "#381a07" },
        sage: { 50: "#f4f7f4", 100: "#e6ede7", 200: "#cedbcf", 300: "#a8c1a9", 400: "#7da481", 500: "#5a885f", 600: "#446d49", 700: "#38583c", 800: "#304733", 900: "#293c2c", 950: "#15201a" },
        ink: "#1a1a1a",
        muted: "#6b7280",
      },
      fontFamily: { display: ["var(--font-display)", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
