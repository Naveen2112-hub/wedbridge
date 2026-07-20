import { collection, doc, addDoc, getDocs, query, where, updateDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type PaymentDocument } from "@/firebase/schema";

export interface PlanInfo { id: "premium" | "gold"; name: string; price: number; features: string[]; }

export const PLANS: PlanInfo[] = [
  { id: "premium", name: "Premium", price: 999, features: ["View contact details", "Send unlimited interests", "AI matching", "Priority support", "Advanced filters"] },
  { id: "gold", name: "Gold", price: 1999, features: ["All Premium features", "Profile highlighting", "Featured placement", "Dedicated relationship manager", "Background verification", "Exclusive matches"] },
];

export async function createPayment(data: Omit<PaymentDocument, "id" | "createdAt" | "updatedAt" | "status">): Promise<string | null> {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, collections.payments), { ...data, status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as Omit<PaymentDocument, "id">);
    return ref.id;
  } catch { return null; }
}

export async function getUserPayments(uid: string, max = 20): Promise<PaymentDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.payments), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) }));
  } catch { return []; }
}

export async function updatePaymentStatus(id: string, status: PaymentDocument["status"]): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.payments, id), { status, updatedAt: serverTimestamp() }); } catch { /* ignore */ }
}
