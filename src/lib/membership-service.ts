import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import type { Membership, PlanId } from "@/lib/plans";

const MEMBERSHIP_COLLECTION = "memberships";

export async function getMembership(uid: string): Promise<Membership | null> {
  const db = getDb();
  const snap = await db.collection(MEMBERSHIP_COLLECTION).doc(uid).get();

  if (!snap.exists) return null;

  const data = snap.data() ?? {};
  return {
    uid,
    plan: data.plan as PlanId,
    status: data.status ?? "expired",
    paymentStatus: data.paymentStatus ?? "pending",
    paymentId: data.paymentId ?? "",
    orderId: data.orderId ?? "",
    amount: data.amount ?? 0,
    currency: data.currency ?? "INR",
    activatedAt: tsToMs(data.activatedAt),
    expiryDate: tsToMs(data.expiryDate),
    createdAt: tsToMs(data.createdAt),
    updatedAt: tsToMs(data.updatedAt),
  };
}

export interface ActivateMembershipInput {
  uid: string;
  plan: PlanId;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export async function activateMembership(
  input: ActivateMembershipInput,
): Promise<Membership> {
  const db = getDb();
  const now = Date.now();
  const expiryDate = now + 365 * 24 * 60 * 60 * 1000;

  const doc = {
    plan: input.plan,
    status: "active",
    paymentStatus: "paid",
    paymentId: input.paymentId,
    orderId: input.orderId,
    amount: input.amount,
    currency: input.currency,
    activatedAt: Timestamp.fromMillis(now),
    expiryDate: Timestamp.fromMillis(expiryDate),
    createdAt: Timestamp.fromMillis(now),
    updatedAt: Timestamp.fromMillis(now),
  };

  await db
    .collection(MEMBERSHIP_COLLECTION)
    .doc(input.uid)
    .set(doc, { merge: true });

  return {
    uid: input.uid,
    plan: input.plan,
    status: "active",
    paymentStatus: "paid",
    paymentId: input.paymentId,
    orderId: input.orderId,
    amount: input.amount,
    currency: input.currency,
    activatedAt: now,
    expiryDate,
    createdAt: now,
    updatedAt: now,
  };
}

function tsToMs(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "_seconds" in value) {
    const s = (value as { _seconds: number })._seconds;
    const ns = (value as { _nanoseconds?: number })._nanoseconds ?? 0;
    return s * 1000 + Math.floor(ns / 1_000_000);
  }
  return null;
}
