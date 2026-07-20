"use client";
import { Crown, Gem, Check, Loader as Loader2 } from "lucide-react";
import { PLANS } from "@/lib/membership/planConfig";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { startRazorpayPayment } from "@/lib/membership/razorpayService";

export function MembershipView() {
  const { toast } = useToast();
  const { user, appUser } = useAuth();
  const currentTier = appUser?.membershipTier ?? "free";

  const handleSubscribe = async (plan: typeof PLANS[number]) => {
    if (!user) { toast("Please login to subscribe", "error"); return; }
    await startRazorpayPayment(
      plan.id as "premium" | "gold",
      { uid: user.uid, email: user.email ?? "", displayName: user.displayName ?? "User" },
      () => toast(`${plan.name} membership activated!`, "success"),
      (msg) => toast(msg, "error"),
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center"><h1 className="heading-lg">Choose Your Plan</h1><p className="text-lead mt-3">Unlock premium features to find your perfect match faster</p></div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan, i) => (
          <div key={plan.id} className={`card relative p-8 ${i === 1 ? "ring-2 ring-secondary-400" : ""}`}>
            {i === 1 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-secondary-500 text-white">Most Popular</span>}
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${plan.id === "gold" ? "bg-amber-100 text-amber-600" : "bg-secondary-100 text-secondary-700"}`}>{plan.id === "gold" ? <Gem className="h-6 w-6" /> : <Crown className="h-6 w-6" />}</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-primary-900">{plan.name}</h2>
            <p className="mt-2 font-display text-3xl font-bold text-primary-900">{formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-500">/year</span></p>
            <ul className="mt-6 space-y-3">{plan.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 flex-none text-green-600" />{f}</li>)}</ul>
            {currentTier === plan.id ? (
              <button type="button" disabled className="mt-8 w-full rounded-xl bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700">Current Plan</button>
            ) : (
              <button type="button" onClick={() => handleSubscribe(plan)} className={`mt-8 w-full ${plan.id === "gold" ? "btn-secondary" : "btn-primary"}`}>Subscribe to {plan.name}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
