"use client";
import { PLANS } from "@/lib/membership/planConfig";
import { createOrder, openCheckout, verifyPayment, isPaymentConfigured } from "@/lib/membership/paymentService";
import type { MembershipTier } from "@/firebase/schema";

interface RazorpayUser { uid: string; email: string; displayName: string }

export async function startRazorpayPayment(
  planId: MembershipTier,
  user: RazorpayUser,
  onSuccess: (result: { plan: string; paymentId: string; expiryDate: string }) => void,
  onError: (msg: string) => void,
): Promise<void> {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) { onError("Invalid plan"); return; }
  if (!isPaymentConfigured()) { onError("Razorpay not configured"); return; }

  try {
    // 1. Create a real Razorpay order on the backend
    const order = await createOrder({ uid: user.uid, plan: plan.id, amount: plan.price });

    // 2. Open Razorpay Checkout
    const result = await openCheckout({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "WedBridge",
      description: `${plan.name} Membership — 1 Year`,
      prefill: { name: user.displayName, email: user.email },
      keyId: order.keyId,
    });

    if (!result) { onError("Payment cancelled"); return; }

    // 3. Verify signature on the server (activates membership automatically if valid)
    const verified = await verifyPayment({
      paymentId: order.paymentId,
      razorpayOrderId: result.gatewayOrderId || order.orderId,
      razorpayPaymentId: result.gatewayPaymentId,
      razorpaySignature: result.gatewaySignature,
      uid: user.uid,
      plan: plan.id,
    });

    onSuccess({ plan: verified.membershipPlan, paymentId: verified.paymentId, expiryDate: verified.expiryDate });
  } catch (e) {
    onError(e instanceof Error ? e.message : "Payment failed");
  }
}
