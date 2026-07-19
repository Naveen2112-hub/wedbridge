"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface SubmitButtonProps { children: ReactNode; loading?: boolean; disabled?: boolean; className?: string; }

export function SubmitButton({ children, loading, disabled, className }: SubmitButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <button type="submit" disabled={disabled || loading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={cn("btn-primary w-full transition-all duration-300", hover && !disabled && "scale-[1.02] shadow-glow", className)}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
