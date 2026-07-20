import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type InterestDocument, type InterestStatus, type MembershipTier } from "@/firebase/schema";
import { createNotification } from "@/lib/notifications/notificationService";

export const FREE_DAILY_INTEREST_LIMIT = 20;
const EXPIRY_DAYS = 30;

export type InterestDirection = "sent" | "received";

export interface InterestWithProfile extends InterestDocument {
  profileUid: string;
  profileName: string;
  profilePhoto?: string;
}

export class InterestLimitError extends Error {
  constructor() { super("daily-limit-reached"); this.name = "InterestLimitError"; }
}

function startOfDay(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getTodaySentCount(uid: string): Promise<number> {
  if (!db) return 0;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.interests), where("senderId", "==", uid), where("createdAt", ">=", new Date(startOfDay()))));
    return snap.size;
  } catch {
    return 0;
  }
}

export async function sendInterest(senderId: string, senderName: string, receiverId: string, membership: MembershipTier | undefined): Promise<void> {
  if (!db) return;
  const database = db;
  if (senderId === receiverId) return;
  try {
    const existing = await getDocs(query(collection(database, collections.interests), where("senderId", "==", senderId), where("receiverId", "==", receiverId), limit(1)));
    if (!existing.empty) return;
    if (!membership || membership === "free") {
      const count = await getTodaySentCount(senderId);
      if (count >= FREE_DAILY_INTEREST_LIMIT) throw new InterestLimitError();
    }
    const now = serverTimestamp();
    const ref = await addDoc(collection(database, collections.interests), {
      senderId, fromUserId: senderId, fromUserName: senderName, receiverId, toUserId: receiverId, status: "pending" as InterestStatus, createdAt: now, updatedAt: now,
    } as Omit<InterestDocument, "id">);
    await createNotification(receiverId, {
      title: "New Interest Received",
      message: `${senderName} sent you an interest request.`,
      type: "interest_received",
      metadata: { interestId: ref.id, senderId },
    });
  } catch (e) {
    if (e instanceof InterestLimitError) throw e;
  }
}

export async function updateInterestStatus(interestId: string, status: InterestStatus, receiverName?: string, senderId?: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await updateDoc(doc(database, collections.interests, interestId), { status, updatedAt: serverTimestamp() });
    if (senderId && receiverName && (status === "accepted" || status === "rejected")) {
      await createNotification(senderId, {
        title: status === "accepted" ? "Interest Accepted" : "Interest Rejected",
        message: status === "accepted" ? `${receiverName} accepted your interest.` : `${receiverName} declined your interest.`,
        type: status === "accepted" ? "interest_accepted" : "interest_rejected",
        metadata: { interestId },
      });
    }
  } catch { /* ignore */ }
}

export async function acceptInterest(interestId: string, receiverName: string, senderId: string): Promise<void> {
  return updateInterestStatus(interestId, "accepted", receiverName, senderId);
}

export async function rejectInterest(interestId: string, receiverName: string, senderId: string): Promise<void> {
  return updateInterestStatus(interestId, "rejected", receiverName, senderId);
}

export async function cancelInterest(interestId: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await updateDoc(doc(database, collections.interests, interestId), { status: "cancelled" as InterestStatus, updatedAt: serverTimestamp() });
  } catch { /* ignore */ }
}

export async function withdrawInterest(interestId: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await deleteDoc(doc(database, collections.interests, interestId));
  } catch { /* ignore */ }
}

export async function getInterestBetween(senderId: string, receiverId: string): Promise<InterestDocument | null> {
  if (!db) return null;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.interests), where("senderId", "==", senderId), where("receiverId", "==", receiverId), limit(1)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as Omit<InterestDocument, "id">) };
  } catch {
    return null;
  }
}

export async function listInterests(uid: string, direction: InterestDirection, max = 50): Promise<InterestWithProfile[]> {
  if (!db) return [];
  const database = db;
  try {
    const field = direction === "sent" ? "senderId" : "receiverId";
    const snap = await getDocs(query(collection(database, collections.interests), where(field, "==", uid), orderBy("createdAt", "desc"), limit(max)));
    const items: InterestWithProfile[] = [];
    for (const d of snap.docs) {
      const data = d.data() as Omit<InterestDocument, "id">;
      const otherUid = direction === "sent" ? data.receiverId : data.senderId;
      const pSnap = await getDocs(query(collection(database, collections.profiles), where("__name__", "==", otherUid), limit(1)));
      let profileName = "Member";
      let profilePhoto: string | undefined;
      if (!pSnap.empty) {
        const p = pSnap.docs[0].data() as { name?: string; photoURL?: string };
        profileName = p.name ?? "Member";
        profilePhoto = p.photoURL;
      }
      items.push({ id: d.id, ...data, profileUid: otherUid ?? "", profileName, profilePhoto });
    }
    return items;
  } catch {
    return [];
  }
}

export function subscribeInterests(uid: string, direction: InterestDirection, cb: (items: InterestDocument[]) => void, max = 50): Unsubscribe {
  if (!db) return () => {};
  const database = db;
  const field = direction === "sent" ? "senderId" : "receiverId";
  try {
    const q = query(collection(database, collections.interests), where(field, "==", uid), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(q, (snap) => {
      const items: InterestDocument[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<InterestDocument, "id">) }));
      cb(items);
    }, () => cb([]));
  } catch {
    return () => {};
  }
}

export function subscribeUnreadInterestCount(uid: string, cb: (count: number) => void): Unsubscribe {
  if (!db) return () => {};
  const database = db;
  try {
    const q = query(collection(database, collections.interests), where("receiverId", "==", uid), where("status", "==", "pending"));
    return onSnapshot(q, (snap) => cb(snap.size), () => cb(0));
  } catch {
    return () => {};
  }
}

export function expireOldInterests(): void {
  if (!db) return;
  const database = db;
  const cutoff = new Date(Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  getDocs(query(collection(database, collections.interests), where("status", "==", "pending"), where("createdAt", "<", cutoff)))
    .then((snap) => { snap.forEach((d) => updateDoc(d.ref, { status: "expired" as InterestStatus, updatedAt: serverTimestamp() }).catch(() => {})); })
    .catch(() => {});
}
