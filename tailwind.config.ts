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
        success: {
          50: "#F0FDF4", 100: "#DCFCE7", 200: "#BBF7D0", 300: "#86EFAC", 400: "#4ADE80",
          500: "#22C55E", 600: "#16A34A", 700: "#15803D", 800: "#166534", 900: "#14532D",
        },
        warning: {
          50: "#FFFBEB", 100: "#FEF3C7", 200: "#FDE68A", 300: "#FCD34D", 400: "#FBBF24",
          500: "#F59E0B", 600: "#D97706", 700: "#B45309", 800: "#92400E", 900: "#78350F",
        },
        error: {
          50: "#FEF2F2", 100: "#FEE2E2", 200: "#FECACA", 300: "#FCA5A5", 400: "#F87171",
          500: "#EF4444", 600: "#DC2626", 700: "#B91C1C", 800: "#991B1B", 900: "#7F1D1D",
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
      fontSize: {
        "display-2xl": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-md": ["2rem", { lineHeight: "1.2" }],
        "display-sm": ["1.5rem", { lineHeight: "1.25" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 12px -4px rgba(122, 16, 34, 0.08)",
        card: "0 4px 24px -8px rgba(122, 16, 34, 0.12)",
        elevated: "0 12px 48px -12px rgba(122, 16, 34, 0.18)",
        glow: "0 0 32px -4px rgba(201, 162, 39, 0.35)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.15)",
      },
      backgroundImage: {
        "hero-texture": "radial-gradient(circle at 20% 20%, rgba(201,162,39,0.10), transparent 40%), radial-gradient(circle at 80% 80%, rgba(122,16,34,0.08), transparent 45%)",
        "grain-texture": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='40' height='40' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        "gradient-warm": "linear-gradient(135deg, #7A1022 0%, #A6323D 50%, #C9A227 100%)",
        "gradient-soft": "linear-gradient(180deg, #FBF3F4 0%, #FFFDF7 100%)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-right": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "pulse-soft": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.7" } },
        "bounce-subtle": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-right": "slide-right 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "smooth-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
