import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff5f5", 100: "#ffe6e6", 200: "#ffcccc", 300: "#ffa6a6",
          400: "#ff7070", 500: "#f53e3e", 600: "#e01e1e", 700: "#b91515",
          800: "#991717", 900: "#7c1818",
        },
        secondary: {
          50: "#f8f5ff", 100: "#f3edff", 200: "#e9dcff", 300: "#d6c2ff",
          400: "#b89aff", 500: "#9a6fff", 600: "#7c4ee0", 700: "#6a3dc0",
          800: "#5a32a0", 900: "#4a2880",
        },
        accent: {
          50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
          400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
          800: "#92400e", 900: "#78350f",
        },
        success: {
          50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
          400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
          800: "#166534", 900: "#14532d",
        },
        warning: {
          50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
          400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
          800: "#92400e", 900: "#78350f",
        },
        error: {
          50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5",
          400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c",
          800: "#991b1b", 900: "#7f1d1d",
        },
        brand: {
          50: "#fff5f5", 100: "#ffe6e6", 200: "#ffcccc", 300: "#ffa6a6",
          400: "#ff7070", 500: "#f53e3e", 600: "#e01e1e", 700: "#b91515",
          800: "#991717", 900: "#7c1818",
        },
        gold: { 400: "#e8c468", 500: "#d4a93f", 600: "#b8881f" },
        rose: {
          50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af",
          400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c",
          800: "#9f1239", 900: "#881337",
        },
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
