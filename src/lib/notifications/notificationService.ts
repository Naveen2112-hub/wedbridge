import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit, doc, updateDoc, deleteDoc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type NotificationDocument, type NotificationType } from "@/firebase/schema";
import { sanitizeText } from "@/lib/utils";

export async function createNotification(userId: string, input: { title: string; message: string; type?: NotificationType; metadata?: Record<string, unknown> }): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, collections.notifications), {
      userId, title: sanitizeText(input.title), message: sanitizeText(input.message), type: input.type ?? "system", read: false, metadata: input.metadata ?? {}, sentBy: "system", createdAt: serverTimestamp(),
    } as Omit<NotificationDocument, "id">);
  } catch { /* ignore */ }
}

export async function broadcastNotification(input: { title: string; message: string; target: "all" | "premium" | "free" | "vendors" }): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.notifications), { ...input, userId: input.target, title: sanitizeText(input.title), message: sanitizeText(input.message), read: false, sentBy: "admin", createdAt: serverTimestamp() } as Omit<NotificationDocument, "id">); } catch { /* ignore */ }
}

export async function getNotifications(max = 50): Promise<NotificationDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.notifications), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationDocument, "id">) })); } catch { return []; }
}

export async function getUserNotifications(userId: string, max = 50): Promise<NotificationDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.notifications), where("userId", "in", [userId, "all", "premium", "free", "vendors"]), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationDocument, "id">) })); } catch { return []; }
}

export function subscribeNotifications(userId: string, cb: (items: NotificationDocument[]) => void, max = 50): Unsubscribe {
  if (!db) return () => {};
  try {
    const q = query(collection(db, collections.notifications), where("userId", "in", [userId, "all", "premium", "free", "vendors"]), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationDocument, "id">) }))), () => cb([]));
  } catch { return () => {}; }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.notifications, id), { read: true }); } catch { /* ignore */ }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!db) return;
  try {
    const snap = await getDocs(query(collection(db, collections.notifications), where("userId", "==", userId), where("read", "==", false)));
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
  } catch { /* ignore */ }
}

export async function deleteNotification(id: string): Promise<void> {
  if (!db) return;
  try { await deleteDoc(doc(db, collections.notifications, id)); } catch { /* ignore */ }
}
