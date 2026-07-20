import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type VendorPackageDocument, type VendorGalleryDocument, type VendorReviewDocument } from "@/firebase/schema";
import { sanitizeText } from "@/lib/utils";

export async function getPackages(vendorId: string): Promise<VendorPackageDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendorPackages), where("vendorId", "==", vendorId), orderBy("createdAt", "desc"))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorPackageDocument, "id">) })); } catch { return []; }
}
export async function addPackage(vendorId: string, data: { name: string; description: string; price: number; inclusions: string[] }): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.vendorPackages), { vendorId, ...data, name: sanitizeText(data.name), description: sanitizeText(data.description), createdAt: serverTimestamp() } as Omit<VendorPackageDocument, "id">); } catch { /* ignore */ }
}
export async function getGallery(vendorId: string): Promise<VendorGalleryDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendorGallery), where("vendorId", "==", vendorId), orderBy("createdAt", "desc"))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorGalleryDocument, "id">) })); } catch { return []; }
}
export async function addGalleryImage(vendorId: string, imageURL: string, caption?: string): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.vendorGallery), { vendorId, imageURL, caption: caption ? sanitizeText(caption) : "", createdAt: serverTimestamp() } as Omit<VendorGalleryDocument, "id">); } catch { /* ignore */ }
}
export async function getReviews(vendorId: string): Promise<VendorReviewDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendorReviews), where("vendorId", "==", vendorId), orderBy("createdAt", "desc"))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorReviewDocument, "id">) })); } catch { return []; }
}
export async function addReview(data: Omit<VendorReviewDocument, "id" | "createdAt">): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.vendorReviews), { ...data, review: sanitizeText(data.review), createdAt: serverTimestamp() } as Omit<VendorReviewDocument, "id">); } catch { /* ignore */ }
}
