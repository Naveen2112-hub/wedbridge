import { collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy, limit, startAfter, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
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

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function dataURLtoBlob(dataURL: string): Blob {
  const [meta, b64] = dataURL.split(",");
  const mime = meta.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function compressImage(file: File, maxDim = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function saveProfile(uid: string, data: Partial<ProfileDocument>): Promise<void> {
  if (!db) return;
  try { await setDoc(doc(db, collections.profiles, uid), { ...data, uid, userId: uid, updatedAt: serverTimestamp() }, { merge: true }); } catch { /* ignore */ }
}

export function calculateCompletion(profile: Partial<ProfileDocument>): { percentage: number; filled: number; total: number; missing: string[] } {
  const fields: (keyof ProfileDocument)[] = ["name", "gender", "dateOfBirth", "religion", "caste", "motherTongue", "education", "occupation", "district", "phone", "bio", "photoURL"];
  const missing: string[] = [];
  let filled = 0;
  for (const f of fields) {
    const v = profile[f];
    if (v !== undefined && v !== null && v !== "") filled++;
    else missing.push(f as string);
  }
  return { percentage: Math.round((filled / fields.length) * 100), filled, total: fields.length, missing };
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
    let profiles = slice.map((d) => ({ id: d.id, uid: d.id, ...(d.data() as Omit<ProfileDocument, "id" | "uid">) }));
    if (filters.caste) profiles = profiles.filter((r) => r.caste?.toLowerCase().includes(filters.caste!.toLowerCase()));
    return { profiles, cursor: slice[slice.length - 1] ?? null, hasMore };
  } catch { return { profiles: [], cursor: null, hasMore: false }; }
}
