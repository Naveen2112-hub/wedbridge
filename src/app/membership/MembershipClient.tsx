"use client";
import { useEffect, useState } from "react";
import { Crown, Check, Loader as Loader2, ShieldCheck, Star, Sparkles, CircleAlert as AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { getActiveSubscription, getEffectiveTier, daysUntilExpiry, activateSubscription } from "@/lib/membership/membershipService";
import type { SubscriptionDocument } from "@/firebase/schema";
import { createOrder, verifyPayment, openCheckout, isPaymentConfigured, updatePaymentStatus } from "@/lib/membership/paymentService";
import { createNotification } from "@/lib/notifications/notificationService";
import { MEMBERSHIP_PLANS, planRank, type MembershipTier } from "@/firebase/schema";
import { cn } from "@/lib/cn";

export default function MembershipClient() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [sub, setSub] = useState<SubscriptionDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<MembershipTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const configured = isPaymentConfigured();

  useEffect(() => {
    if (!user?.uid) return;
    (async () => { setSub(await getActiveSubscription(user.uid)); setLoading(false); })();
  }, [user?.uid]);

  const currentTier = getEffectiveTier(sub);
  const days = daysUntilExpiry(sub);

  const handlePurchase = async (tier: MembershipTier) => {
    if (!user?.uid) return;
    if (tier === "free") return;
    setError(null);
    setBusy(tier);
    try {
      const plan = MEMBERSHIP_PLANS.find((p) => p.id === tier)!;
      if (!configured) {
        await activateSubscription(user.uid, tier, "demo-payment", plan.price, planRank(tier) > planRank(currentTier) ? "upgrade" : "renew");
        setSub(await getActiveSubscription(user.uid));
        await createNotification(user.uid, { title: "Premium Activated", message: `Your ${plan.name} plan is now active.`, type: "premium_activated" });
        return;
      }
      const order = await createOrder({ uid: user.uid, plan: tier, amount: plan.price });
      const result = await openCheckout({
        orderId: order.orderId, amount: order.amount, currency: order.currency,
        name: "WedBridge", description: `${plan.name} Membership`,
        prefill: { name: user.displayName ?? "", email: user.email ?? "" },
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
      });
      if (!result) { await updatePaymentStatus(order.paymentId, "cancelled"); setError(t("membershipPage.paymentCancelled")); return; }
      const verified = await verifyPayment({ paymentId: order.paymentId, gatewayPaymentId: result.gatewayPaymentId, gatewaySignature: result.gatewaySignature });
      if (!verified) { setError(t("membershipPage.paymentFailed")); return; }
      await activateSubscription(user.uid, tier, order.paymentId, plan.price, planRank(tier) > planRank(currentTier) ? "upgrade" : "renew");
      setSub(await getActiveSubscription(user.uid));
      await createNotification(user.uid, { title: "Premium Activated", message: `Your ${plan.name} plan is now active.`, type: "premium_activated" });
    } catch {
      setError(t("membershipPage.paymentFailed"));
    } finally { setBusy(null); }
  };

  const planIcons: Record<string, React.ComponentType<{ className?: string }>> = { free: ShieldCheck, basic: ShieldCheck, premium: Crown, gold: Star };

  return (
    <AuthGuard><ProtectedLayout>
      <div className="space-y-6">
        <div><h1 className="heading-lg flex items-center gap-2"><Crown className="h-7 w-7 text-secondary-600" />{t("membershipPage.title")}</h1><p className="text-lead mt-2">{t("membershipPage.subtitle")}</p></div>

        {sub && days > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary-200 bg-secondary-50/60 p-4">
            <div><p className="text-sm font-semibold text-secondary-900">{t("membershipPage.currentPlan")}: {MEMBERSHIP_PLANS.find((p) => p.id === currentTier)?.name}</p><p className="text-xs text-secondary-700">{t("membershipPage.expiresOn")}: {new Date(days * 86400000 + Date.now()).toLocaleDateString()}</p></div>
          </div>
        )}
        {error && <p className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</p>}
        {!configured && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{t("membershipPage.paymentNotConfigured")}</p>}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {MEMBERSHIP_PLANS.map((plan) => {
            const Icon = planIcons[plan.id] ?? Crown;
            const isCurrent = currentTier === plan.id;
            const isUpgrade = planRank(plan.id) > planRank(currentTier);
            const isRenew = plan.id === currentTier && plan.id !== "free";
            const label = isCurrent ? t("membershipPage.current") : isUpgrade ? t("membershipPage.upgrade") : isRenew ? t("membershipPage.renew") : plan.id === "free" ? t("membershipPage.current") : t("membershipPage.choosePlan");
            return (
              <div key={plan.id} className={cn("relative flex flex-col rounded-2xl bg-white p-6 shadow-md transition", plan.highlighted && "ring-2 ring-secondary-500")}>
                {plan.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-secondary-500 px-3 py-1 text-xs font-bold text-white">{t("membershipPage.popular")}</span>}
                <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", plan.id === "gold" ? "bg-amber-100 text-amber-700" : plan.id === "premium" ? "bg-secondary-100 text-secondary-700" : plan.id === "basic" ? "bg-blue-50 text-blue-700" : "bg-primary-50 text-primary-700")}><Icon className="h-6 w-6" /></span>
                <h3 className="mt-4 font-display text-xl font-bold text-primary-900">{t(`membershipPage.plans.${plan.id}.name` as never)}</h3>
                <p className="mt-1 text-sm text-gray-500">{t(`membershipPage.plans.${plan.id}.desc` as never)}</p>
                <p className="mt-3 font-display text-3xl font-bold text-primary-900">{t(`membershipPage.plans.${plan.id}.price` as never)}<span className="text-sm font-normal text-gray-500"> / {t(`membershipPage.plans.${plan.id}.period` as never)}</span></p>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-gray-900/80"><Check className="mt-0.5 h-4 w-4 flex-none text-green-600" />{f}</li>)}
                </ul>
                <button type="button" disabled={isCurrent || busy === plan.id || plan.id === "free"} onClick={() => handlePurchase(plan.id)} className={cn("mt-5 w-full justify-center", plan.highlighted ? "btn-secondary" : "btn-primary", (isCurrent || plan.id === "free") && "opacity-60")}>
                  {busy === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
                </button>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-900"><Sparkles className="h-5 w-5 text-secondary-600" />{t("membershipPage.benefits")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[{ icon: Crown, title: "Premium Badge", desc: "Stand out with a premium badge on your profile" }, { icon: Star, title: "Priority Ranking", desc: "Appear higher in search results" }, { icon: ShieldCheck, title: "Unlimited Interests", desc: "Send unlimited interests to profiles you like" }, { icon: Sparkles, title: "Unlimited AI Matches", desc: "Get unlimited AI-powered compatibility matches" }, { icon: Check, title: "Unlimited Contact Views", desc: "View contact details without daily limits" }, { icon: Crown, title: "Featured Profile", desc: "Get featured placement on the homepage" }].map((b) => (
              <div key={b.title} className="rounded-xl border border-primary-50 p-4"><b.icon className="h-5 w-5 text-secondary-600" /><p className="mt-2 text-sm font-semibold text-primary-900">{b.title}</p><p className="text-xs text-gray-500">{b.desc}</p></div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout></AuthGuard>
  );
}
