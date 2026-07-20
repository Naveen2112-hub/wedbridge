import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, addDoc, updateDoc, serverTimestamp, startAfter, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type VendorDocument, type VendorCategory, type VendorStatus } from "@/firebase/schema";

export const PAGE_SIZE = 9;
export interface VendorFilters { category?: VendorCategory; city?: string; district?: string; state?: string; minPrice?: number; maxPrice?: number; minRating?: number; verifiedOnly?: boolean; }
export interface VendorListResult { vendors: VendorDocument[]; cursor: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean; }

function toVendor(d: QueryDocumentSnapshot<DocumentData>): VendorDocument { return { id: d.id, ...(d.data() as Omit<VendorDocument, "id">) }; }

export async function getApprovedVendors(max = 100): Promise<VendorDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendors), where("status", "==", "approved" as VendorStatus), orderBy("featured", "desc"), orderBy("rating", "desc"), limit(max))); return snap.docs.map(toVendor); } catch { return []; }
}
export async function getFeaturedVendors(max = 8): Promise<VendorDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendors), where("status", "==", "approved" as VendorStatus), where("featured", "==", true), limit(max))); return snap.docs.map(toVendor); } catch { return []; }
}
export async function getVendor(id: string): Promise<VendorDocument | null> {
  if (!db) return null;
  try { const snap = await getDoc(doc(db, collections.vendors, id)); return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<VendorDocument, "id">) } : null; } catch { return null; }
}
export async function searchVendors(filters: VendorFilters, cursor?: QueryDocumentSnapshot<DocumentData> | null): Promise<VendorListResult> {
  if (!db) return { vendors: [], cursor: null, hasMore: false };
  try {
    const constraints: ReturnType<typeof where>[] = [where("status", "==", "approved" as VendorStatus)];
    if (filters.category) constraints.push(where("category", "==", filters.category));
    if (filters.city) constraints.push(where("city", "==", filters.city));
    if (filters.district) constraints.push(where("district", "==", filters.district));
    if (filters.state) constraints.push(where("state", "==", filters.state));
    if (filters.verifiedOnly) constraints.push(where("verificationStatus", "==", "verified"));
    if (filters.minRating) constraints.push(where("rating", ">=", filters.minRating));
    let q = query(collection(db, collections.vendors), ...constraints, orderBy("featured", "desc"), orderBy("rating", "desc"), limit(PAGE_SIZE + 1));
    if (cursor) q = query(q, startAfter(cursor));
    const snap = await getDocs(q);
    const docs = snap.docs;
    const hasMore = docs.length > PAGE_SIZE;
    const slice = hasMore ? docs.slice(0, PAGE_SIZE) : docs;
    let vendors = slice.map(toVendor);
    if (filters.minPrice !== undefined) vendors = vendors.filter((v) => v.startingPrice >= filters.minPrice!);
    if (filters.maxPrice !== undefined) vendors = vendors.filter((v) => v.startingPrice <= filters.maxPrice!);
    return { vendors, cursor: slice[slice.length - 1] ?? null, hasMore };
  } catch { return { vendors: [], cursor: null, hasMore: false }; }
}
export async function getVendorByOwner(uid: string): Promise<VendorDocument | null> {
  if (!db) return null;
  try { const snap = await getDocs(query(collection(db, collections.vendors), where("ownerUid", "==", uid), limit(1))); if (snap.empty) return null; const d = snap.docs[0]; return { id: d.id, ...(d.data() as Omit<VendorDocument, "id">) }; } catch { return null; }
}
export async function createVendor(data: Omit<VendorDocument, "id" | "createdAt" | "updatedAt" | "rating" | "reviewCount" | "featured" | "status" | "verificationStatus">): Promise<string> {
  if (!db) throw new Error("db-not-configured");
  const ref = await addDoc(collection(db, collections.vendors), { ...data, rating: 0, reviewCount: 0, featured: false, status: "pending" as VendorStatus, verificationStatus: "unverified", createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as Omit<VendorDocument, "id">);
  return ref.id;
}
export async function updateVendor(id: string, data: Partial<VendorDocument>): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.vendors, id), { ...data, updatedAt: serverTimestamp() }); } catch { /* ignore */ }
}
export async function listAllVendors(max = 100): Promise<VendorDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendors), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map(toVendor); } catch { return []; }
}
