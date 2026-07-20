import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, PLAN_LIMITS, planRank, type MembershipTier, type ProfileDocument } from "@/firebase/schema";
import { getEffectiveTier } from "@/lib/membership/membershipService";
import type { SubscriptionDocument } from "@/firebase/schema";

export type ContactVisibility = "everyone" | "after_accept" | "premium_only";

export const DEFAULT_CONTACT_VISIBILITY: ContactVisibility = "after_accept";

export interface ContactAccessResult {
  allowed: boolean;
  reason: "ok" | "premium_only" | "interest_not_accepted" | "limit_reached" | "hidden";
  phone?: string;
  email?: string;
}

export async function getContactVisibility(uid: string): Promise<ContactVisibility> {
  if (!db) return DEFAULT_CONTACT_VISIBILITY;
  const database = db;
  try {
    const snap = await getDoc(doc(database, collections.profiles, uid));
    if (!snap.exists()) return DEFAULT_CONTACT_VISIBILITY;
    const p = snap.data() as ProfileDocument;
    return (p.contactVisibility as ContactVisibility) ?? DEFAULT_CONTACT_VISIBILITY;
  } catch {
    return DEFAULT_CONTACT_VISIBILITY;
  }
}

export async function setContactVisibility(uid: string, visibility: ContactVisibility): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await updateDoc(doc(database, collections.profiles, uid), { contactVisibility: visibility, updatedAt: serverTimestamp() });
  } catch { /* ignore */ }
}

export async function canViewContact(viewerUid: string, profile: ProfileDocument, viewerSub: SubscriptionDocument | null, interestAccepted: boolean): Promise<ContactAccessResult> {
  const visibility = (profile.contactVisibility as ContactVisibility) ?? DEFAULT_CONTACT_VISIBILITY;
  const viewerTier = getEffectiveTier(viewerSub);
  if (visibility === "premium_only" && !isPremiumTier(viewerTier)) {
    return { allowed: false, reason: "premium_only" };
  }
  if (visibility === "after_accept" && !interestAccepted && viewerUid !== profile.uid) {
    return { allowed: false, reason: "interest_not_accepted" };
  }
  const limit = PLAN_LIMITS[viewerTier].contactViewsPerDay;
  if (limit !== Infinity) {
    const used = await getTodayContactViewCount(viewerUid);
    if (used >= limit) return { allowed: false, reason: "limit_reached" };
  }
  if (viewerUid !== profile.uid) await recordContactView(viewerUid, profile.uid);
  return { allowed: true, reason: "ok", phone: profile.phone, email: profile.email };
}

function isPremiumTier(tier: MembershipTier): boolean {
  return planRank(tier) >= planRank("basic");
}

function startOfDay(): number { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }

export async function getTodayContactViewCount(uid: string): Promise<number> {
  if (!db) return 0;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.profileViews), where("viewerUid", "==", uid), where("viewedAt", ">=", new Date(startOfDay()))));
    return snap.size;
  } catch {
    return 0;
  }
}

export async function recordContactView(viewerId: string, profileUid: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    const { addDoc } = await import("firebase/firestore");
    await addDoc(collection(database, collections.profileViews), { viewerUid: viewerId, profileUid, viewedAt: serverTimestamp() });
  } catch { /* ignore */ }
}
