import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, addDoc, serverTimestamp, increment, getDoc, deleteDoc, updateDoc, type QueryConstraint, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type ProfileDocument, type SearchHistoryDocument, type RecentlyViewedDocument, type ProfileViewDocument } from "@/firebase/schema";
import { calculateAge } from "@/lib/format";

const PAGE_SIZE = 9;

export interface SearchFilters {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  maritalStatus?: string;
  district?: string;
  state?: string;
  country?: string;
  education?: string;
  occupation?: string;
  annualIncome?: string;
  height?: string;
  verified?: boolean;
  premium?: boolean;
  withPhoto?: boolean;
  recentlyJoined?: boolean;
  onlineNow?: boolean;
  star?: string;
  rasi?: string;
  manglik?: string;
  familyType?: string;
  food?: string;
  smoking?: string;
  drinking?: string;
  lifestyle?: string;
}

export interface SearchResult {
  profiles: ProfileDocument[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export type SortOption = "newest" | "oldest" | "popular" | "relevance";

function filtersToQueryConstraints(filters: SearchFilters, sort: SortOption): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  const f = filters || {};
  if (f.gender && f.gender !== "any") constraints.push(where("gender", "==", f.gender));
  if (f.religion) constraints.push(where("religion", "==", f.religion));
  if (f.caste) constraints.push(where("caste", "==", f.caste));
  if (f.motherTongue) constraints.push(where("motherTongue", "==", f.motherTongue));
  if (f.maritalStatus && f.maritalStatus !== "any") constraints.push(where("maritalStatus", "==", f.maritalStatus));
  if (f.district) constraints.push(where("district", "==", f.district));
  if (f.state) constraints.push(where("state", "==", f.state));
  if (f.country) constraints.push(where("country", "==", f.country));
  if (f.education) constraints.push(where("education", "==", f.education));
  if (f.occupation) constraints.push(where("occupation", "==", f.occupation));
  if (f.annualIncome) constraints.push(where("annualIncome", "==", f.annualIncome));
  if (f.height) constraints.push(where("height", "==", f.height));
  if (f.verified) constraints.push(where("verificationStatus", "==", "verified"));
  if (f.premium) constraints.push(where("membership", "in", ["premium", "elite"]));
  if (f.onlineNow) constraints.push(where("online", "==", true));
  if (f.familyType && f.familyType !== "any") constraints.push(where("familyType", "==", f.familyType));
  if (f.food && f.food !== "any") constraints.push(where("foodPreference", "==", f.food));
  if (f.smoking && f.smoking !== "any") constraints.push(where("smoking", "==", f.smoking));
  if (f.drinking && f.drinking !== "any") constraints.push(where("drinking", "==", f.drinking));
  if (f.lifestyle && f.lifestyle !== "any") constraints.push(where("lifestyle", "==", f.lifestyle));
  if (f.star) constraints.push(where("star", "==", f.star));
  if (f.rasi) constraints.push(where("rasi", "==", f.rasi));
  if (f.manglik && f.manglik !== "any") constraints.push(where("manglik", "==", f.manglik));
  if (sort === "newest") constraints.push(orderBy("createdAt", "desc"));
  else if (sort === "oldest") constraints.push(orderBy("createdAt", "asc"));
  else if (sort === "popular") constraints.push(orderBy("viewCount", "desc"));
  return constraints;
}

function buildSearchQuery(filters: SearchFilters, sort: SortOption, cursor?: QueryDocumentSnapshot<DocumentData> | null): QueryConstraint[] {
  const constraints = filtersToQueryConstraints(filters, sort);
  constraints.push(limit(PAGE_SIZE));
  if (cursor) constraints.push(startAfter(cursor));
  return constraints;
}

function applyClientFilters(profiles: ProfileDocument[], filters: SearchFilters): ProfileDocument[] {
  let result = profiles;
  const f = filters || {};
  if (f.minAge !== undefined || f.maxAge !== undefined) {
    result = result.filter((p) => {
      if (!p.dateOfBirth) return false;
      const age = calculateAge(p.dateOfBirth);
      if (f.minAge !== undefined && age < f.minAge) return false;
      if (f.maxAge !== undefined && age > f.maxAge) return false;
      return true;
    });
  }
  if (f.withPhoto) result = result.filter((p) => Boolean(p.photoURL));
  if (f.recentlyJoined) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    result = result.filter((p) => {
      const created = p.createdAt as unknown as { toMillis?: () => number } | number | null;
      const ms = typeof created === "number" ? created : created?.toMillis?.() ?? 0;
      return ms >= thirtyDaysAgo;
    });
  }
  return result;
}

export async function searchProfiles(filters: SearchFilters, sort: SortOption = "newest", cursor?: QueryDocumentSnapshot<DocumentData> | null): Promise<SearchResult> {
  if (!db) return { profiles: [], lastVisible: null, hasMore: false };
  try {
    const constraints = buildSearchQuery(filters, sort, cursor);
    const q = query(collection(db, collections.profiles), ...constraints);
    const snap = await getDocs(q);
    const profiles: ProfileDocument[] = [];
    snap.forEach((d) => profiles.push({ uid: d.id, ...(d.data() as Omit<ProfileDocument, "uid">) }));
    const filtered = applyClientFilters(profiles, filters);
    const lastVisible = snap.docs[snap.docs.length - 1] ?? null;
    const hasMore = snap.size === PAGE_SIZE;
    return { profiles: filtered, lastVisible, hasMore };
  } catch {
    return { profiles: [], lastVisible: null, hasMore: false };
  }
}

export function calculateCompatibility(a: ProfileDocument, b: ProfileDocument): number {
  let score = 0;
  let total = 0;
  const add = (cond: boolean, weight = 1) => { total += weight; if (cond) score += weight; };
  add(a.religion === b.religion, 3);
  add(a.caste === b.caste, 2);
  add(a.motherTongue === b.motherTongue, 2);
  add(a.district === b.district, 2);
  add(a.state === b.state, 1);
  add(a.country === b.country, 1);
  add(a.maritalStatus === b.maritalStatus, 1);
  add(a.education === b.education, 1);
  add(a.occupation === b.occupation, 1);
  add(a.familyType === b.familyType, 1);
  add(a.foodPreference === b.foodPreference, 1);
  if (a.dateOfBirth && b.dateOfBirth) {
    const ageA = calculateAge(a.dateOfBirth);
    const ageB = calculateAge(b.dateOfBirth);
    add(Math.abs(ageA - ageB) <= 5, 2);
  }
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

export async function getRelatedProfiles(profile: ProfileDocument, max = 4): Promise<ProfileDocument[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, collections.profiles), where("gender", "!=", profile.gender ?? ""), limit(20));
    const snap = await getDocs(q);
    const all: ProfileDocument[] = [];
    snap.forEach((d) => { if (d.id !== profile.uid) all.push({ uid: d.id, ...(d.data() as Omit<ProfileDocument, "uid">) }); });
    const scored = all.map((p) => ({ p, score: calculateCompatibility(profile, p) })).sort((a, b) => b.score - a.score);
    return scored.slice(0, max).map((s) => s.p);
  } catch {
    return [];
  }
}

const viewedInSession = new Set<string>();

export async function recordProfileView(viewerUid: string, profileUid: string): Promise<void> {
  if (!db) return;
  if (viewerUid === profileUid) return;
  const key = `${viewerUid}:${profileUid}`;
  if (viewedInSession.has(key)) return;
  viewedInSession.add(key);
  try {
    const ref = doc(db, collections.profiles, profileUid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as ProfileDocument;
      if (data.viewCount === undefined) { await updateDoc(ref, { viewCount: 1 }); }
      else { await updateDoc(ref, { viewCount: increment(1) }); }
    }
    await addDoc(collection(db, collections.profileViews), {
      viewerUid, profileUid, viewedAt: serverTimestamp(),
    } as Omit<ProfileViewDocument, "id">);
  } catch { /* ignore */ }
}

export async function addRecentlyViewed(uid: string, profileUid: string): Promise<void> {
  if (!db) return;
  try {
    const existing = await getDocs(query(collection(db, collections.recentlyViewed), where("uid", "==", uid), where("profileUid", "==", profileUid), limit(1)));
    await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));
    await addDoc(collection(db, collections.recentlyViewed), {
      uid, profileUid, viewedAt: serverTimestamp(),
    } as Omit<RecentlyViewedDocument, "id">);
  } catch { /* ignore */ }
}

export async function getRecentlyViewed(uid: string, max = 6): Promise<ProfileDocument[]> {
  if (!db) return [];
  try {
    const rvSnap = await getDocs(query(collection(db, collections.recentlyViewed), where("uid", "==", uid), orderBy("viewedAt", "desc"), limit(max)));
    if (rvSnap.empty) return [];
    const uids: string[] = [];
    rvSnap.forEach((d) => uids.push((d.data() as RecentlyViewedDocument).profileUid));
    const profiles: ProfileDocument[] = [];
    for (const pid of uids) {
      const pSnap = await getDoc(doc(db, collections.profiles, pid));
      if (pSnap.exists()) profiles.push({ uid: pSnap.id, ...(pSnap.data() as Omit<ProfileDocument, "uid">) });
    }
    return profiles;
  } catch {
    return [];
  }
}

export async function saveSearchHistory(uid: string, filters: SearchFilters): Promise<void> {
  if (!db) return;
  try {
    const parts: string[] = [];
    const f = filters || {};
    if (f.gender && f.gender !== "any") parts.push(f.gender);
    if (f.minAge || f.maxAge) parts.push(`${f.minAge ?? ""}-${f.maxAge ?? ""}`);
    if (f.religion) parts.push(f.religion);
    if (f.caste) parts.push(f.caste);
    if (f.district) parts.push(f.district);
    if (f.state) parts.push(f.state);
    const queryStr = parts.join(", ") || "All profiles";
    await addDoc(collection(db, collections.searchHistory), {
      uid, query: queryStr, filters: filters as Record<string, unknown>, searchedAt: serverTimestamp(),
    } as Omit<SearchHistoryDocument, "id">);
  } catch { /* ignore */ }
}

export async function getSearchHistory(uid: string, max = 8): Promise<SearchHistoryDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.searchHistory), where("uid", "==", uid), orderBy("searchedAt", "desc"), limit(max)));
    const items: SearchHistoryDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<SearchHistoryDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}

export async function clearSearchHistory(uid: string): Promise<void> {
  if (!db) return;
  try {
    const snap = await getDocs(query(collection(db, collections.searchHistory), where("uid", "==", uid)));
    const deletes = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletes);
  } catch { /* ignore */ }
}
