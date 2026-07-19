import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/firebase/config";
import { collections, storagePaths, type ProfileDocument, REQUIRED_PROFILE_FIELDS, OPTIONAL_PROFILE_FIELDS } from "@/firebase/schema";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function compressImage(file: File, maxSize = 1024, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio); height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas-unsupported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("compress-failed")), "image/jpeg", quality);
      };
      img.onerror = () => reject(new Error("image-load-failed"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsDataURL(file);
  });
}

export function dataURLtoBlob(dataURL: string): Blob {
  const [meta, b64] = dataURL.split(",");
  const mime = /data:(.*?);/.exec(meta)?.[1] ?? "image/jpeg";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function uploadProfilePhoto(uid: string, blob: Blob, ext = "jpg"): Promise<string> {
  if (!storage) throw new Error("storage-not-configured");
  const path = `${storagePaths.profilePhotos}/${uid}/main.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, blob, { contentType: blob.type || "image/jpeg" });
  return getDownloadURL(r);
}

export async function uploadGalleryPhoto(uid: string, blob: Blob, index: number, ext = "jpg"): Promise<string> {
  if (!storage) throw new Error("storage-not-configured");
  const path = `${storagePaths.profilePhotos}/${uid}/gallery-${index}.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, blob, { contentType: blob.type || "image/jpeg" });
  return getDownloadURL(r);
}

export async function uploadDocument(uid: string, file: File): Promise<string> {
  if (!storage) throw new Error("storage-not-configured");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${storagePaths.documents}/${uid}/${Date.now()}.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

export function calculateCompletion(profile: Partial<ProfileDocument>): { percentage: number; filled: number; total: number; missing: string[] } {
  const all = [...REQUIRED_PROFILE_FIELDS, ...OPTIONAL_PROFILE_FIELDS];
  let filled = 0;
  const missing: string[] = [];
  for (const key of all) {
    const v = profile[key];
    const has = v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
    if (has) filled++; else missing.push(String(key));
  }
  const total = all.length;
  const percentage = Math.round((filled / total) * 100);
  return { percentage, filled, total, missing };
}

export async function saveProfile(uid: string, data: Partial<ProfileDocument>): Promise<void> {
  if (!db) throw new Error("db-not-configured");
  const completion = calculateCompletion(data as ProfileDocument);
  const payload = { ...data, uid, completedFieldsCount: completion.filled, completionPercentage: completion.percentage, updatedAt: serverTimestamp() };
  await setDoc(doc(db, collections.profiles, uid), payload, { merge: true });
  await setDoc(doc(db, collections.users, uid), { profileCompleted: completion.percentage >= 50, photoURL: data.photoURL ?? "", name: data.name ?? "", updatedAt: serverTimestamp() }, { merge: true });
}

export async function getProfile(uid: string): Promise<ProfileDocument | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, collections.profiles, uid));
  return snap.exists() ? (snap.data() as ProfileDocument) : null;
}

export { MAX_PHOTO_BYTES };
