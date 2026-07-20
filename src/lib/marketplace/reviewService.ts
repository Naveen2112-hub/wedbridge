import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type VendorReviewDocument } from "@/firebase/schema";
import { hasUserBookedVendor } from "@/lib/marketplace/bookingService";

export async function getReviews(vendorId: string, max = 50): Promise<VendorReviewDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.vendorReviews), where("vendorId", "==", vendorId), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorReviewDocument, "id">) }));
  } catch { return []; }
}

export async function addReview(data: { vendorId: string; userId: string; userName: string; rating: number; review: string }): Promise<void> {
  if (!db) return;
  const verified = await hasUserBookedVendor(data.userId, data.vendorId);
  await addDoc(collection(db, collections.vendorReviews), { ...data, verifiedBooking: verified, reported: false, createdAt: serverTimestamp() } as Omit<VendorReviewDocument, "id">);
}

export async function reportReview(id: string): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.vendorReviews, id), { reported: true }); } catch { /* ignore */ }
}
