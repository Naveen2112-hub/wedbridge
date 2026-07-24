import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

const CACHE_COLLECTION = "compatibility_cache";
const DEFAULT_TTL_MS = 30 * 60 * 1000;

interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

function makeCacheKey(...parts: (string | number)[]): string {
  return parts.join(":");
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, CACHE_COLLECTION, key));
    if (!snap.exists()) return null;
    const entry = snap.data() as CacheEntry<T>;
    if (entry.expiresAt && new Date(entry.expiresAt).getTime() < Date.now()) {
      return null;
    }
    setDoc(snap.ref, { hitCount: (entry.hitCount ?? 0) + 1 }, { merge: true }).catch(() => {});
    return entry.value;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): Promise<void> {
  if (!db) return;
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt,
      hitCount: 0,
    };
    await setDoc(doc(db, CACHE_COLLECTION, key), entry);
  } catch {
    // Cache failures are non-fatal
  }
}

export async function getOrCompute<T>(
  key: string,
  compute: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) return cached;
  const value = await compute();
  await setCached(key, value, ttlMs);
  return value;
}

export const cacheKeys = {
  compatibility: (uidA: string, uidB: string) => makeCacheKey("compat", uidA < uidB ? `${uidA}:${uidB}` : `${uidB}:${uidA}`),
  recommendations: (uid: string) => makeCacheKey("recs", uid),
  aiMatches: (uid: string, tab: string) => makeCacheKey("aimatch", uid, tab),
  vendorRanking: (category: string, budget: number) => makeCacheKey("vendor", category, budget),
  searchResult: (filtersHash: string) => makeCacheKey("search", filtersHash),
  adminAnalytics: () => makeCacheKey("admin", "analytics"),
};
