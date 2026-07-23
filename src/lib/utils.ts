import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(ms: unknown): string {
  if (!ms) return "—";
  if (typeof ms === "number") {
    return new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }
  if (typeof ms === "object" && ms !== null && "_seconds" in ms) {
    const s = (ms as { _seconds: number })._seconds;
    return new Date(s * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }
  if (typeof ms === "string") {
    return new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }
  return "—";
}

export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, "").trim();
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
