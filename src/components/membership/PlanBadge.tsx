"use client";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { MembershipTier } from "@/firebase/schema";
import { Crown, Star, ShieldCheck } from "lucide-react";

export function PlanBadge({ tier, className }: { tier: MembershipTier; className?: string }) {
  const { t } = useLanguage();
  if (tier === "free") return null;
  const styles: Record<string, string> = {
    basic: "bg-blue-50 text-blue-700",
    premium: "bg-secondary-100 text-secondary-800",
    gold: "bg-amber-100 text-amber-800",
  };
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    basic: ShieldCheck, premium: Crown, gold: Star,
  };
  const Icon = icons[tier] ?? ShieldCheck;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", styles[tier], className)}>
      <Icon className="h-3 w-3" />
      {t(`badges.${tier}` as never)}
    </span>
  );
}
