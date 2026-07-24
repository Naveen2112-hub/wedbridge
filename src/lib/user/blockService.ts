import { collection, doc, getDoc, getDocs, query, where, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";

export interface BlockRecord {
  id: string;
  blockerUid: string;
  blockedUid: string;
  createdAt: Date;
  reason?: string;
}

export async function blockUser(blockerUid: string, blockedUid: string, reason?: string): Promise<boolean> {
  if (!db || blockerUid === blockedUid) return false;
  try {
    const existing = await getDocs(
      query(
        collection(db, collections.blocks),
        where("blockerUid", "==", blockerUid),
        where("blockedUid", "==", blockedUid),
      ),
    );
    if (!existing.empty) return true;

    await addDoc(collection(db, collections.blocks), {
      blockerUid,
      blockedUid,
      reason: reason ?? "",
      createdAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function unblockUser(blockerUid: string, blockedUid: string): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDocs(
      query(
        collection(db, collections.blocks),
        where("blockerUid", "==", blockerUid),
        where("blockedUid", "==", blockedUid),
      ),
    );
    if (snap.empty) return false;
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    return true;
  } catch {
    return false;
  }
}

export async function isBlocked(blockerUid: string, blockedUid: string): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDocs(
      query(
        collection(db, collections.blocks),
        where("blockerUid", "==", blockerUid),
        where("blockedUid", "==", blockedUid),
      ),
    );
    return !snap.empty;
  } catch {
    return false;
  }
}

export async function getBlockedUsers(uid: string): Promise<BlockRecord[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(collection(db, collections.blocks), where("blockerUid", "==", uid)),
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlockRecord, "id">) }));
  } catch {
    return [];
  }
}

export async function isEitherBlocked(uidA: string, uidB: string): Promise<boolean> {
  const aBlockedB = await isBlocked(uidA, uidB);
  if (aBlockedB) return true;
  return isBlocked(uidB, uidA);
}
