import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FBF3F4", 100: "#F7E6E8", 200: "#EFCCD0", 300: "#E0A3A9", 400: "#C9656E",
          500: "#A6323D", 600: "#7A1022", 700: "#660D1C", 800: "#520A16", 900: "#3D070F", 950: "#2A050A",
        },
        secondary: {
          50: "#FBF7EA", 100: "#F6EFC5", 200: "#EDDFA0", 300: "#E0CB6F", 400: "#D4B842",
          500: "#C9A227", 600: "#A8821C", 700: "#856018", 800: "#5F4413", 900: "#3D2C0E",
        },
        accent: {
          50: "#FDE7F1", 100: "#FBC8DF", 200: "#F793C0", 300: "#F25BA0", 400: "#ED3484",
          500: "#E91E63", 600: "#C2185B", 700: "#9A1249", 800: "#720D37", 900: "#4A0823",
        },
        ink: "#1A1416",
        muted: "#6B5E62",
        background: "#FFFDF7",
        card: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -8px rgba(122, 16, 34, 0.12)",
        card: "0 10px 40px -12px rgba(122, 16, 34, 0.18)",
        glow: "0 0 24px -4px rgba(201, 162, 39, 0.45)",
      },
      backgroundImage: {
        "hero-texture": "radial-gradient(circle at 20% 20%, rgba(201,162,39,0.10), transparent 40%), radial-gradient(circle at 80% 80%, rgba(122,16,34,0.08), transparent 45%)",
        "grain-texture": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='40' height='40' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: { "fade-up": "fade-up 0.6s ease-out", shimmer: "shimmer 2s linear infinite" },
    },
  },
  plugins: [],
};
export default config;
