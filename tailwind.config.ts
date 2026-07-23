import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
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
