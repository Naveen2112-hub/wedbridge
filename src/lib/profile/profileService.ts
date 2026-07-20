import { collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp, orderBy, limit, startAfter, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { collections, type ProfileDocument } from "@/firebase/schema";
import { sanitizeText } from "@/lib/utils";

export async function createProfile(data: Omit<ProfileDocument, "id" | "createdAt" | "updatedAt" | "status" | "premium" | "verified" | "featured">): Promise<string | null> {
  if (!db) return null;
  try {
    const sanitized = { ...data, name: sanitizeText(data.name), bio: data.bio ? sanitizeText(data.bio) : "" };
    const ref = await addDoc(collection(db, collections.profiles), { ...sanitized, status: "pending", premium: false, verified: false, featured: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as Omit<ProfileDocument, "id">);
    return ref.id;
  } catch { return null; }
}

export async function getProfile(id: string): Promise<ProfileDocument | null> {
  if (!db) return null;
  try { const snap = await getDoc(doc(db, collections.profiles, id)); return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<ProfileDocument, "id">) } : null; } catch { return null; }
}

export async function getProfileByUserId(uid: string): Promise<ProfileDocument | null> {
  if (!db) return null;
  try { const snap = await getDocs(query(collection(db, collections.profiles), where("userId", "==", uid), limit(1))); if (snap.empty) return null; const d = snap.docs[0]; return { id: d.id, ...(d.data() as Omit<ProfileDocument, "id">) }; } catch { return null; }
}

export async function updateProfile(id: string, data: Partial<ProfileDocument>): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.profiles, id), { ...data, updatedAt: serverTimestamp() }); } catch { /* ignore */ }
}

export async function deleteProfile(id: string): Promise<void> {
  if (!db) return;
  try { await deleteDoc(doc(db, collections.profiles, id)); } catch { /* ignore */ }
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string | null> {
  if (!storage) return null;
  try {
    const path = `profiles/${uid}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch { return null; }
}

export async function deleteProfilePhoto(photoURL: string): Promise<void> {
  if (!storage || !photoURL) return;
  try { await deleteObject(ref(storage, photoURL)); } catch { /* ignore */ }
}

export interface SearchFilters {
  gender?: "male" | "female"; religion?: string; caste?: string; city?: string; district?: string; state?: string;
  minAge?: number; maxAge?: number; minHeight?: number; maxHeight?: number; maritalStatus?: string; education?: string; occupation?: string; verifiedOnly?: boolean; premiumOnly?: boolean;
}

export const SEARCH_PAGE_SIZE = 12;

export interface SearchResult { profiles: ProfileDocument[]; cursor: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean; }

export async function searchProfiles(filters: SearchFilters, cursor?: QueryDocumentSnapshot<DocumentData> | null): Promise<SearchResult> {
  if (!db) return { profiles: [], cursor: null, hasMore: false };
  try {
    const constraints: ReturnType<typeof where>[] = [where("status", "==", "approved"), where("gender", "==", filters.gender ?? "female")];
    if (filters.religion) constraints.push(where("religion", "==", filters.religion));
    if (filters.district) constraints.push(where("district", "==", filters.district));
    if (filters.city) constraints.push(where("city", "==", filters.city));
    if (filters.maritalStatus) constraints.push(where("maritalStatus", "==", filters.maritalStatus));
    if (filters.verifiedOnly) constraints.push(where("verified", "==", true));
    if (filters.premiumOnly) constraints.push(where("premium", "==", true));
    let q = query(collection(db, collections.profiles), ...constraints, orderBy("createdAt", "desc"), limit(SEARCH_PAGE_SIZE + 1));
    if (cursor) q = query(q, startAfter(cursor));
    const snap = await getDocs(q);
    const docs = snap.docs;
    const hasMore = docs.length > SEARCH_PAGE_SIZE;
    const slice = hasMore ? docs.slice(0, SEARCH_PAGE_SIZE) : docs;
    let profiles = slice.map((d) => ({ id: d.id, ...(d.data() as Omit<ProfileDocument, "id">) }));
    if (filters.caste) profiles = profiles.filter((r) => r.caste?.toLowerCase().includes(filters.caste!.toLowerCase()));
    return { profiles, cursor: slice[slice.length - 1] ?? null, hasMore };
  } catch { return { profiles: [], cursor: null, hasMore: false }; }
}
