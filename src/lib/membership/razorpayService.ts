"use client";
import { collection, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type PaymentDocument, type AppUser } from "@/firebase/schema";
import { PLANS } from "@/lib/membership/planConfig";
import { createPayment, verifyPaymentAndActivateMembership } from "@/lib/membership/membershipService";
import { updateDoc } from "firebase/firestore";

declare global {
  interface Window { Razorpay: new (options: RazorpayOptions) => RazorpayInstance; }
}
interface RazorpayOptions { key: string; amount: number; currency: string; name: string; description: string; order_id?: string; prefill: { name: string; email: string }; theme: { color: string }; handler: (response: RazorpayResponse) => void; modal: { ondismiss: () => void }; }
interface RazorpayResponse { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string; }
interface RazorpayInstance { open: () => void; }

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || window.Razorpay) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export async function startRazorpayPayment(planId: "premium" | "gold", user: { uid: string; email: string; displayName: string }, onSuccess: () => void, onError: (msg: string) => void): Promise<void> {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) { onError("Invalid plan"); return; }
  if (!RAZORPAY_KEY) { onError("Razorpay not configured"); return; }

  try {
    await loadRazorpayScript();
    const paymentId = await createPayment({ userId: user.uid, userName: user.displayName, amount: plan.price, plan: plan.id });
    if (!paymentId) { onError("Failed to create payment record"); return; }

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: plan.price * 100,
      currency: "INR",
      name: "WedBridge",
      description: `${plan.name} Membership - 1 Year`,
      prefill: { name: user.displayName, email: user.email },
      theme: { color: "#a51d3c" },
      handler: async (response: RazorpayResponse) => {
        await verifyPaymentAndActivateMembership(paymentId, user.uid, plan.id, response.razorpay_payment_id);
        onSuccess();
      },
      modal: { ondismiss: () => onError("Payment cancelled") },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Payment failed");
  }
}
