"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Calendar, ArrowRight, CircleCheck as CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getActiveSubscription, getEffectiveTier, daysUntilExpiry, isExpiringSoon, getPlan } from "@/lib/membership/membershipService";
import type { SubscriptionDocument, MembershipTier } from "@/firebase/schema";
import { PlanBadge } from "@/components/membership/PlanBadge";

export function MembershipCard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [sub, setSub] = useState<SubscriptionDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => { setSub(await getActiveSubscription(user.uid)); setLoading(false); })();
  }, [user?.uid]);

  if (loading) return <div className="skeleton h-40 w-full rounded-2xl" />;
  const tier = getEffectiveTier(sub);
  const plan = getPlan(tier);
  const days = daysUntilExpiry(sub);
  const expiring = isExpiringSoon(sub);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-800"><Crown className="h-5 w-5" /></span>
        <h2 className="font-display text-lg font-semibold text-primary-900">{t("membershipPage.currentPlan")}</h2>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-2xl font-bold text-primary-900">{plan?.name ?? tier}</p>
            <PlanBadge tier={tier} />
          </div>
          {sub && days !== null ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><Calendar className="h-3.5 w-3.5" />{t("membershipPage.expiresOn")}: {new Date(days * 86400000 + Date.now()).toLocaleDateString()}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">{t("membershipPage.noActive")}</p>
          )}
        </div>
      </div>
      {expiring && days !== null && days >= 0 && (
        <p className="mt-2 text-sm text-amber-600">{days} {days === 1 ? "day" : "days"} remaining</p>
      )}
      <Link href="/membership" className="btn-primary mt-4 w-full text-sm">
        {tier === "free" ? t("membershipPage.upgrade") : t("membershipPage.renew")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
