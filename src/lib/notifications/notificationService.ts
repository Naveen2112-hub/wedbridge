import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type NotificationDocument } from "@/firebase/schema";
import { sanitizeText } from "@/lib/utils";

export async function broadcastNotification(input: { title: string; message: string; target: "all" | "premium" | "free" | "vendors" }): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.notifications), { ...input, title: sanitizeText(input.title), message: sanitizeText(input.message), sentBy: "admin", createdAt: serverTimestamp() } as Omit<NotificationDocument, "id">); } catch { /* ignore */ }
}

export async function getNotifications(max = 50): Promise<NotificationDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.notifications), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationDocument, "id">) })); } catch { return []; }
}
