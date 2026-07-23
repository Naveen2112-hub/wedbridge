import { collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type SubscriptionDocument, type MembershipTier, type PaymentDocument, type PlanInfo } from "@/firebase/schema";
import { PLANS } from "@/lib/membership/planConfig";
import { sendNotification } from "@/lib/telegram-notifications";

export { PLANS };
export type { PlanInfo };

export async function getActiveSubscription(uid: string): Promise<SubscriptionDocument | null> {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, collections.subscriptions), where("uid", "==", uid), where("status", "==", "active"), orderBy("endDate", "desc"), limit(1)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as Omit<SubscriptionDocument, "id">) };
  } catch { return null; }
}

export function getEffectiveTier(sub: SubscriptionDocument | null): MembershipTier {
  if (!sub) return "free";
  const endMs = toMillis(sub.endDate);
  if (endMs && endMs < Date.now()) return "free";
  return sub.plan;
}

export function daysUntilExpiry(sub: SubscriptionDocument | null): number {
  if (!sub || !sub.endDate) return 0;
  const endMs = toMillis(sub.endDate);
  if (!endMs) return 0;
  return Math.max(0, Math.ceil((endMs - Date.now()) / (24 * 60 * 60 * 1000)));
}

export function isExpiringSoon(sub: SubscriptionDocument | null, withinDays = 7): boolean {
  const days = daysUntilExpiry(sub);
  return days > 0 && days <= withinDays;
}

export function getPlan(tier: MembershipTier): PlanInfo | undefined {
  return PLANS.find((p) => p.id === tier);
}

export async function activateSubscription(uid: string, plan: MembershipTier, paymentId: string, _amount?: number, _mode?: string, durationDays?: number): Promise<SubscriptionDocument | null> {
  if (!db) return null;
  try {
    const days = durationDays ?? 365;
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
    const ref = await addDoc(collection(db, collections.subscriptions), {
      uid, plan, status: "active", membershipStatus: "active", paymentStatus: "paid", membershipPlan: plan, paymentProvider: "Razorpay", paymentId, startDate, endDate: expiryDate, expiryDate, autoRenew: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    } as Omit<SubscriptionDocument, "id">);
    void sendNotification("membership_purchased").catch(() => {});
    return { id: ref.id, uid, plan, status: "active", membershipStatus: "active", paymentStatus: "paid", membershipPlan: plan, paymentProvider: "Razorpay", paymentId, startDate, endDate: expiryDate, expiryDate, autoRenew: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  } catch { return null; }
}

export async function createPayment(input: { userId: string; userName?: string; amount: number; plan: MembershipTier }): Promise<string | null> {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, collections.payments), {
      uid: input.userId, userId: input.userId, userName: input.userName ?? "", amount: input.amount * 100, currency: "INR", plan: input.plan, gateway: "razorpay", status: "pending", notes: {}, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    } as Omit<PaymentDocument, "id">);
    return ref.id;
  } catch { return null; }
}

export async function verifyPaymentAndActivateMembership(paymentId: string, uid: string, plan: MembershipTier, _gatewayPaymentId: string): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, collections.payments, paymentId), { status: "verified", gatewayPaymentId: _gatewayPaymentId, updatedAt: serverTimestamp() });
    await activateSubscription(uid, plan, paymentId);
    return true;
  } catch { return false; }
}

export async function listAllSubscriptions(max = 100): Promise<SubscriptionDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.subscriptions), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SubscriptionDocument, "id">) }));
  } catch { return []; }
}

function toMillis(date: unknown): number | null {
  if (!date) return null;
  if (typeof date === "number") return date;
  if (typeof date === "string") return new Date(date).getTime();
  if (typeof date === "object" && date && "toMillis" in date && typeof (date as { toMillis: () => number }).toMillis === "function") return (date as { toMillis: () => number }).toMillis();
  return null;
}
