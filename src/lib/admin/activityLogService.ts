import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";
import { logger } from "@/lib/monitoring/logger";

export interface AdminActivityLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  target: string;
  details?: string;
  createdAt: unknown;
}

export async function logAdminActivity(adminUid: string, adminEmail: string, action: string, target: string, details?: string): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, collections.auditLog), { adminUid, adminEmail, action, target, details: details ?? "", createdAt: serverTimestamp() });
    logger.info("Admin activity logged", { action, target, adminUid });
  } catch (e) {
    logger.error("Failed to log admin activity", { error: e instanceof Error ? e.message : String(e) });
  }
}

export async function getAdminActivityLogs(max = 50): Promise<AdminActivityLog[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.auditLog), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminActivityLog, "id">) }));
  } catch { return []; }
}

export function formatLogAction(action: string): { label: string; color: string } {
  const actionMap: Record<string, { label: string; color: string }> = {
    login: { label: "Login", color: "text-blue-600 bg-blue-50" },
    logout: { label: "Logout", color: "text-gray-600 bg-gray-50" },
    create: { label: "Create", color: "text-green-600 bg-green-50" },
    update: { label: "Update", color: "text-amber-600 bg-amber-50" },
    delete: { label: "Delete", color: "text-red-600 bg-red-50" },
    approve: { label: "Approve", color: "text-emerald-600 bg-emerald-50" },
    reject: { label: "Reject", color: "text-rose-600 bg-rose-50" },
    export: { label: "Export", color: "text-indigo-600 bg-indigo-50" },
    backup: { label: "Backup", color: "text-purple-600 bg-purple-50" },
    settings: { label: "Settings", color: "text-cyan-600 bg-cyan-50" },
  };
  return actionMap[action] ?? { label: action, color: "text-gray-600 bg-gray-50" };
}
