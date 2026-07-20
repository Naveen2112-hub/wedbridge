import { collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
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
  try {
    const snap = await getDoc(doc(db, collections.profiles, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<ProfileDocument, "id">) };
  } catch { return null; }
}

export async function getProfileByUserId(uid: string): Promise<ProfileDocument | null> {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, collections.profiles), where("userId", "==", uid), limit(1)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as Omit<ProfileDocument, "id">) };
  } catch { return null; }
}

export async function updateProfile(id: string, data: Partial<ProfileDocument>): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.profiles, id), { ...data, updatedAt: serverTimestamp() }); } catch { /* ignore */ }
}

export async function deleteProfile(id: string): Promise<void> {
  if (!db) return;
  try { await deleteDoc(doc(db, collections.profiles, id)); } catch { /* ignore */ }
}

export interface SearchFilters {
  gender?: "male" | "female"; religion?: string; caste?: string; city?: string;
  district?: string; state?: string; minAge?: number; maxAge?: number; minHeight?: number; maxHeight?: number;
  maritalStatus?: string; education?: string; occupation?: string; verifiedOnly?: boolean; premiumOnly?: boolean;
}

export async function searchProfiles(filters: SearchFilters, max = 24): Promise<ProfileDocument[]> {
  if (!db) return [];
  try {
    const constraints = [where("status", "==", "approved"), where("gender", "==", filters.gender ?? "female")];
    if (filters.religion) constraints.push(where("religion", "==", filters.religion));
    if (filters.district) constraints.push(where("district", "==", filters.district));
    if (filters.city) constraints.push(where("city", "==", filters.city));
    if (filters.maritalStatus) constraints.push(where("maritalStatus", "==", filters.maritalStatus));
    if (filters.verifiedOnly) constraints.push(where("verified", "==", true));
    if (filters.premiumOnly) constraints.push(where("premium", "==", true));
    const snap = await getDocs(query(collection(db, collections.profiles), ...constraints, orderBy("createdAt", "desc"), limit(max)));
    let results = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProfileDocument, "id">) }));
    if (filters.caste) results = results.filter((r) => r.caste?.toLowerCase().includes(filters.caste!.toLowerCase()));
    return results;
  } catch { return []; }
}
