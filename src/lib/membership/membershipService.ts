import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, updateDoc, serverTimestamp, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, MEMBERSHIP_PLANS, PLAN_LIMITS, planRank, type MembershipTier, type SubscriptionDocument, type MembershipHistoryDocument, type PlanInfo } from "@/firebase/schema";

export { MEMBERSHIP_PLANS, PLAN_LIMITS, planRank };

export function getPlan(tier: MembershipTier): PlanInfo {
  return MEMBERSHIP_PLANS.find((p) => p.id === tier) ?? MEMBERSHIP_PLANS[0];
}

export function getEffectiveTier(sub: SubscriptionDocument | null): MembershipTier {
  if (!sub || sub.status !== "active") return "free";
  const end = tsToMillis(sub.endDate);
  if (end && end < Date.now()) return "free";
  return sub.plan;
}

function tsToMillis(ts: unknown): number | null {
  if (!ts) return null;
  if (typeof ts === "number") return ts;
  if (typeof ts === "object" && ts && "toMillis" in ts && typeof (ts as { toMillis: () => number }).toMillis === "function") return (ts as { toMillis: () => number }).toMillis();
  return null;
}

export function isPremium(tier: MembershipTier): boolean {
  return tier !== "free";
}

export async function getActiveSubscription(uid: string): Promise<SubscriptionDocument | null> {
  if (!db) return null;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.subscriptions), where("uid", "==", uid), where("status", "==", "active"), orderBy("createdAt", "desc"), limit(1)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    const sub = { id: d.id, ...(d.data() as Omit<SubscriptionDocument, "id">) };
    const end = tsToMillis(sub.endDate);
    if (end && end < Date.now()) return null;
    return sub;
  } catch {
    return null;
  }
}

export function subscribeActiveSubscription(uid: string, cb: (sub: SubscriptionDocument | null) => void): Unsubscribe {
  if (!db) return () => {};
  const database = db;
  try {
    const q = query(collection(database, collections.subscriptions), where("uid", "==", uid), where("status", "==", "active"), orderBy("createdAt", "desc"), limit(1));
    return onSnapshot(q, (snap) => {
      if (snap.empty) { cb(null); return; }
      const d = snap.docs[0];
      const sub = { id: d.id, ...(d.data() as Omit<SubscriptionDocument, "id">) };
      const end = tsToMillis(sub.endDate);
      cb(end && end < Date.now() ? null : sub);
    }, () => cb(null));
  } catch {
    return () => {};
  }
}

export async function activateSubscription(uid: string, plan: MembershipTier, paymentId: string, amount: number, action: MembershipHistoryDocument["action"]): Promise<SubscriptionDocument> {
  if (!db) throw new Error("db-not-configured");
  const database = db;
  const planInfo = getPlan(plan);
  const now = Date.now();
  const start = now;
  const end = now + planInfo.periodDays * 24 * 60 * 60 * 1000;
  const existing = await getActiveSubscription(uid);
  if (existing) {
    await updateDoc(doc(database, collections.subscriptions, existing.id), { plan, status: "active", startDate: start, endDate: end, paymentId, updatedAt: serverTimestamp() });
    await addDoc(collection(database, collections.membershipHistory), { uid, fromPlan: existing.plan, toPlan: plan, action, paymentId, amount, createdAt: serverTimestamp() } as Omit<MembershipHistoryDocument, "id">);
    return { ...existing, plan, startDate: start, endDate: end, paymentId };
  }
  const ref = await addDoc(collection(database, collections.subscriptions), { uid, plan, status: "active", startDate: start, endDate: end, paymentId, autoRenew: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as Omit<SubscriptionDocument, "id">);
  await addDoc(collection(database, collections.membershipHistory), { uid, fromPlan: null, toPlan: plan, action, paymentId, amount, createdAt: serverTimestamp() } as Omit<MembershipHistoryDocument, "id">);
  return { id: ref.id, uid, plan, status: "active", startDate: start, endDate: end, paymentId, autoRenew: false, createdAt: now, updatedAt: now };
}

export async function cancelSubscription(uid: string, subId: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await updateDoc(doc(database, collections.subscriptions, subId), { status: "cancelled", updatedAt: serverTimestamp() });
  } catch { /* ignore */ }
}

export async function getMembershipHistory(uid: string, max = 20): Promise<MembershipHistoryDocument[]> {
  if (!db) return [];
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.membershipHistory), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max)));
    const items: MembershipHistoryDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<MembershipHistoryDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}

export function daysUntilExpiry(sub: SubscriptionDocument | null): number | null {
  if (!sub) return null;
  const end = tsToMillis(sub.endDate);
  if (!end) return null;
  return Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000));
}

export function isExpiringSoon(sub: SubscriptionDocument | null): boolean {
  const days = daysUntilExpiry(sub);
  return days !== null && days <= 7 && days >= 0;
}

export async function listAllSubscriptions(max = 100): Promise<SubscriptionDocument[]> {
  if (!db) return [];
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.subscriptions), orderBy("createdAt", "desc"), limit(max)));
    const items: SubscriptionDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<SubscriptionDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}
