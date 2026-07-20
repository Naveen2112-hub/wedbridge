import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, deleteDoc, serverTimestamp, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type FavouriteDocument, type ProfileDocument } from "@/firebase/schema";

export interface FavouriteWithProfile extends FavouriteDocument {
  profile: ProfileDocument | null;
}

export async function addFavourite(userId: string, profileId: string): Promise<void> {
  if (!db) return;
  const database = db;
  if (userId === profileId) return;
  try {
    const existing = await getDocs(query(collection(database, collections.favourites), where("userId", "==", userId), where("profileId", "==", profileId), limit(1)));
    if (!existing.empty) return;
    await addDoc(collection(database, collections.favourites), {
      userId, profileId, createdAt: serverTimestamp(),
    } as Omit<FavouriteDocument, "id">);
  } catch { /* ignore */ }
}

export async function removeFavourite(userId: string, profileId: string): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    const existing = await getDocs(query(collection(database, collections.favourites), where("userId", "==", userId), where("profileId", "==", profileId), limit(1)));
    existing.forEach((d) => { deleteDoc(d.ref).catch(() => {}); });
  } catch { /* ignore */ }
}

export async function isFavourite(userId: string, profileId: string): Promise<boolean> {
  if (!db) return false;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.favourites), where("userId", "==", userId), where("profileId", "==", profileId), limit(1)));
    return !snap.empty;
  } catch {
    return false;
  }
}

export async function getFavouriteIds(userId: string): Promise<Set<string>> {
  if (!db) return new Set();
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.favourites), where("userId", "==", userId)));
    const ids = new Set<string>();
    snap.forEach((d) => ids.add((d.data() as FavouriteDocument).profileId));
    return ids;
  } catch {
    return new Set();
  }
}

export async function getFavouriteCount(userId: string): Promise<number> {
  if (!db) return 0;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.favourites), where("userId", "==", userId)));
    return snap.size;
  } catch {
    return 0;
  }
}

export async function listFavourites(userId: string, max = 50): Promise<FavouriteWithProfile[]> {
  if (!db) return [];
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.favourites), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(max)));
    const items: FavouriteWithProfile[] = [];
    for (const d of snap.docs) {
      const data = d.data() as Omit<FavouriteDocument, "id">;
      let profile: ProfileDocument | null = null;
      const pSnap = await getDocs(query(collection(database, collections.profiles), where("__name__", "==", data.profileId), limit(1)));
      if (!pSnap.empty) profile = { uid: pSnap.docs[0].id, ...(pSnap.docs[0].data() as Omit<ProfileDocument, "uid">) };
      items.push({ id: d.id, ...data, profile });
    }
    return items;
  } catch {
    return [];
  }
}

export async function listRecentlyFavourited(userId: string, max = 6): Promise<FavouriteWithProfile[]> {
  return listFavourites(userId, max);
}

export function subscribeFavourites(userId: string, cb: (items: FavouriteDocument[]) => void, max = 50): Unsubscribe {
  if (!db) return () => {};
  const database = db;
  try {
    const q = query(collection(database, collections.favourites), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(q, (snap) => {
      const items: FavouriteDocument[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<FavouriteDocument, "id">) }));
      cb(items);
    }, () => cb([]));
  } catch {
    return () => {};
  }
}

export function subscribeFavouriteCount(userId: string, cb: (count: number) => void): Unsubscribe {
  if (!db) return () => {};
  const database = db;
  try {
    const q = query(collection(database, collections.favourites), where("userId", "==", userId));
    return onSnapshot(q, (snap) => cb(snap.size), () => cb(0));
  } catch {
    return () => {};
  }
}
