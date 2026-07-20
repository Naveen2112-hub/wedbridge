import { collection, doc, addDoc, getDocs, query, where, updateDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type PaymentDocument, type AppUser } from "@/firebase/schema";
import { PLANS } from "@/lib/membership/planConfig";

export interface PlanInfo { id: "premium" | "gold"; name: string; price: number; features: string[]; }
export { PLANS };

export async function createPayment(data: Omit<PaymentDocument, "id" | "createdAt" | "updatedAt" | "status">): Promise<string | null> {
  if (!db) return null;
  try { const ref = await addDoc(collection(db, collections.payments), { ...data, status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as Omit<PaymentDocument, "id">); return ref.id; } catch { return null; }
}

export async function updatePayment(id: string, data: Partial<PaymentDocument>): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.payments, id), { ...data, updatedAt: serverTimestamp() }); } catch { /* ignore */ }
}

export async function verifyPaymentAndActivateMembership(paymentId: string, userId: string, plan: "premium" | "gold", razorpayPaymentId: string): Promise<void> {
  if (!db) return;
  try {
    await updateDoc(doc(db, collections.payments, paymentId), { status: "verified", razorpayPaymentId, updatedAt: serverTimestamp() });
    await updateDoc(doc(db, collections.users, userId), { membershipTier: plan, updatedAt: serverTimestamp() } as Partial<AppUser>);
  } catch { /* ignore */ }
}

export async function getUserPayments(uid: string, max = 20): Promise<PaymentDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.payments), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) })); } catch { return []; }
}
