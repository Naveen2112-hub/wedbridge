import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#fdf2f4", 100: "#fbe3e7", 200: "#f7c9d1", 300: "#f0a3b2", 400: "#e46e87", 500: "#d44a6a", 600: "#be3553", 700: "#9d2440", 800: "#7A1022", 900: "#5e0a1a", 950: "#3a0410", DEFAULT: "#7A1022" },
        secondary: { 50: "#fdfaf0", 100: "#faf0d6", 200: "#f5e0a8", 300: "#efca6f", 400: "#e7b443", 500: "#d9a02c", 600: "#C9A227", 700: "#a87d1f", 800: "#8a6520", 900: "#73531f", 950: "#432d0e", DEFAULT: "#C9A227" },
        accent: { 50: "#fef0f6", 100: "#fde0ec", 200: "#fbc7dd", 300: "#f79ec8", 400: "#f266a8", 500: "#E91E63", 600: "#d41857", 700: "#b31447", 800: "#93133d", 900: "#7a1438", 950: "#4d071d", DEFAULT: "#E91E63" },
        background: "#FFF8F5", card: "#FFFFFF", ink: "#1f1410", muted: "#6b5b54",
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"], display: ["var(--font-display)", "Georgia", "serif"] },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: { soft: "0 4px 24px -8px rgba(122, 16, 34, 0.12)", card: "0 8px 32px -12px rgba(122, 16, 34, 0.18)", glow: "0 0 0 4px rgba(201, 162, 39, 0.18)" },
      backgroundImage: { "hero-pattern": "radial-gradient(circle at 20% 20%, rgba(201,162,39,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(122,16,34,0.12), transparent 45%)" },
      keyframes: { "fade-up": { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } }, shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } } },
      animation: { "fade-up": "fade-up 0.6s ease-out both", shimmer: "shimmer 2.5s linear infinite" },
    },
  },
  plugins: [],
};

export default config;
