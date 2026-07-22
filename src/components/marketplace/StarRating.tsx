"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-6 w-6" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(sizes[size], n <= Math.round(rating) ? "fill-secondary-400 text-secondary-400" : "fill-primary-100 text-primary-200")} />
      ))}
    </div>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="rounded p-0.5 transition hover:scale-110">
          <Star className={cn("h-7 w-7", n <= value ? "fill-secondary-400 text-secondary-400" : "fill-primary-100 text-primary-300")} />
        </button>
      ))}
    </div>
  );
}
