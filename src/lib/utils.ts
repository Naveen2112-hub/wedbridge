import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, "").trim();
}
