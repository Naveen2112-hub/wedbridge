import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type AuditLogEntry } from "@/firebase/schema";

export async function logAdminAction(entry: Omit<AuditLogEntry, "id" | "createdAt">): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.auditLog), { ...entry, createdAt: serverTimestamp() } as Omit<AuditLogEntry, "id">); } catch { /* ignore */ }
}

export async function getAuditLogs(max = 100): Promise<AuditLogEntry[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.auditLog), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLogEntry, "id">) })); } catch { return []; }
}
