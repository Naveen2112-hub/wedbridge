import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy, limit, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type AppUser, type ProfileDocument, type PaymentDocument, type AuditLogEntry } from "@/firebase/schema";
import { logAdminAction } from "@/lib/admin/schema";

export async function listUsers(max = 200): Promise<AppUser[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.users), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AppUser, "uid">) })); } catch { return []; }
}
export async function updateUser(uid: string, data: Partial<AppUser>, admin?: { uid: string; email: string }): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.users, uid), { ...data, updatedAt: serverTimestamp() }); if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "update_user", target: uid, details: JSON.stringify(data) }); } catch { /* ignore */ }
}
export async function deleteUser(uid: string, admin?: { uid: string; email: string }): Promise<void> {
  if (!db) return;
  try { await deleteDoc(doc(db, collections.users, uid)); if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "delete_user", target: uid }); } catch { /* ignore */ }
}
export async function listProfiles(max = 200): Promise<ProfileDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.profiles), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProfileDocument, "id">) })); } catch { return []; }
}
export async function updateProfile(id: string, data: Partial<ProfileDocument>, admin?: { uid: string; email: string }): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.profiles, id), { ...data, updatedAt: serverTimestamp() }); if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "update_profile", target: id, details: JSON.stringify(data) }); } catch { /* ignore */ }
}
export async function deleteProfile(id: string, admin?: { uid: string; email: string }): Promise<void> {
  if (!db) return;
  try { await deleteDoc(doc(db, collections.profiles, id)); if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "delete_profile", target: id }); } catch { /* ignore */ }
}
export async function listPayments(max = 200): Promise<PaymentDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.payments), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) })); } catch { return []; }
}
export async function updatePayment(id: string, data: Partial<PaymentDocument>, admin?: { uid: string; email: string }): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.payments, id), { ...data, updatedAt: serverTimestamp() }); if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "update_payment", target: id, details: JSON.stringify(data) }); } catch { /* ignore */ }
}
export async function createProfile(data: Omit<ProfileDocument, "id" | "createdAt">, admin?: { uid: string; email: string }): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db!, collections.profiles), { ...data, createdAt: serverTimestamp() }); if (admin) await logAdminAction({ adminUid: admin.uid, adminEmail: admin.email, action: "create_profile", target: "admin", details: data.name }); } catch { /* ignore */ }
}
