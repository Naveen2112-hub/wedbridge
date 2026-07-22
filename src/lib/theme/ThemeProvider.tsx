/**
 * Theme Provider - Dark mode support using CSS variables.
 * Persists theme preference in localStorage.
 */
"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeContextValue { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void; }

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = typeof localStorage !== "undefined" ? (localStorage.getItem("theme") as Theme | null) : null;
    const prefersDark = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document === "undefined") return;
    if (t === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    if (typeof localStorage !== "undefined") localStorage.setItem("theme", t);
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
