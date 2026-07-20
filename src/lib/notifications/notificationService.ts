import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, writeBatch, type Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type NotificationDocument, type NotificationType } from "@/firebase/schema";

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
}

export async function createNotification(userId: string, input: CreateNotificationInput): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await addDoc(collection(database, collections.notifications), {
      userId, title: input.title, message: input.message, type: input.type, read: false, metadata: input.metadata ?? {}, createdAt: serverTimestamp(),
    } as Omit<NotificationDocument, "id">);
  } catch { /* ignore */ }
}

export async function listNotifications(userId: string, max = 50): Promise<NotificationDocument[]> {
  if (!db) return [];
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.notifications), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(max)));
    const items: NotificationDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<NotificationDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await updateDoc(doc(database, collections.notifications, id), { read: true });
  } catch { /* ignore */ }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.notifications), where("userId", "==", userId), where("read", "==", false)));
    if (snap.empty) return;
    const batch = writeBatch(database);
    snap.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch { /* ignore */ }
}

export async function deleteNotification(id: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await deleteDoc(doc(database, collections.notifications, id));
  } catch { /* ignore */ }
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!db) return 0;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.notifications), where("userId", "==", userId), where("read", "==", false)));
    return snap.size;
  } catch {
    return 0;
  }
}

export function subscribeNotifications(userId: string, cb: (items: NotificationDocument[]) => void, max = 50): Unsubscribe {
  if (!db) return () => {};
  const database = db;
  try {
    const q = query(collection(database, collections.notifications), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(q, (snap) => {
      const items: NotificationDocument[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<NotificationDocument, "id">) }));
      cb(items);
    }, () => cb([]));
  } catch {
    return () => {};
  }
}

export function subscribeUnreadCount(userId: string, cb: (count: number) => void): Unsubscribe {
  if (!db) return () => {};
  const database = db;
  try {
    const q = query(collection(database, collections.notifications), where("userId", "==", userId), where("read", "==", false));
    return onSnapshot(q, (snap) => cb(snap.size), () => cb(0));
  } catch {
    return () => {};
  }
}
