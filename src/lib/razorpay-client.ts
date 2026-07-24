"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { PLANS, type PlanId } from "@/lib/plans";

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  plan: PlanId;
  keyId: string;
}

interface VerifyResponse {
  success: boolean;
  membership?: {
    plan: PlanId;
    status: string;
    paymentId: string;
    expiryDate: number;
  };
  error?: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  on: (event: "payment.failed", handler: (resp: unknown) => void) => void;
  open: () => void;
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const { user } = useAuth();
  const { toast } = useToast();

  async function subscribe(planId: PlanId): Promise<boolean> {
    const plan = PLANS[planId];
    if (!plan) {
      toast("Invalid plan selected", "error");
      return false;
    }

    const token = user ? await user.getIdToken() : null;
    if (!token) {
      toast("Please sign in to subscribe", "error");
      return false;
    }

    try {
      await loadScript();

      const orderRes = await fetch("/api/membership/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        toast(err.error ?? "Could not start payment", "error");
        return false;
      }

      const order: CreateOrderResponse = await orderRes.json();

      const paid = await new Promise<boolean>((resolve) => {
        const rzp = new window.Razorpay!({
          key_id: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "WedBridge",
          description: `${plan.name} Membership`,
          order_id: order.orderId,
          prefill: { email: user?.email ?? undefined },
          theme: { color: "#f53e3e" },
          handler: async (response) => {
            const verifyRes = await fetch("/api/membership/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: order.plan,
                amount: order.amount,
                currency: order.currency,
              }),
            });

            const result: VerifyResponse = await verifyRes.json();
            if (verifyRes.ok && result.success) {
              toast("Membership Activated Successfully", "success");
              resolve(true);
            } else {
              toast(result.error ?? "Payment verification failed", "error");
              resolve(false);
            }
          },
          modal: { ondismiss: () => resolve(false) },
        });

        rzp.on("payment.failed", () => resolve(false));
        rzp.open();
      });

      return paid;
    } catch {
      toast("Payment could not be completed", "error");
      return false;
    }
  }

  return { subscribe };
}
