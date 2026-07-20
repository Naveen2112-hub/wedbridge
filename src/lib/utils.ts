import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(inputs)); }
export function formatCurrency(amount: number): string { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount); }
export function formatDate(date: Date | string | number | unknown): string { if (!date) return ""; const d = date instanceof Date ? date : new Date(date as string); if (isNaN(d.getTime())) return ""; return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
export function sanitizeText(text: string): string { return text.replace(/[<>]/g, "").trim(); }
export function validateEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
export function validatePhone(phone: string): boolean { return /^[6-9]\d{9}$/.test(phone.replace(/\s|-/g, "")); }
export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void { let timer: ReturnType<typeof setTimeout>; return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }
export function getTodayKey(): string { return new Date().toISOString().slice(0, 10); }
