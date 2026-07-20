import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type VendorPackageDocument, type VendorGalleryDocument } from "@/firebase/schema";

export async function getPackages(vendorId: string): Promise<VendorPackageDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendorPackages), where("vendorId", "==", vendorId), orderBy("createdAt", "desc"))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorPackageDocument, "id">) })); } catch { return []; }
}
export async function addPackage(vendorId: string, data: { name: string; description: string; price: number; inclusions: string[] }): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.vendorPackages), { vendorId, ...data, createdAt: serverTimestamp() } as Omit<VendorPackageDocument, "id">); } catch { /* ignore */ }
}
export async function getGallery(galleryId: string): Promise<VendorGalleryDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendorGallery), where("vendorId", "==", galleryId), orderBy("createdAt", "desc"))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorGalleryDocument, "id">) })); } catch { return []; }
}
export async function addGalleryImage(vendorId: string, imageURL: string, caption?: string): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.vendorGallery), { vendorId, imageURL, caption, createdAt: serverTimestamp() } as Omit<VendorGalleryDocument, "id">); } catch { /* ignore */ }
}
