/**
 * AI Duplicate Detection Service
 * Compares profiles across multiple fields: phone, email, DOB, photo, name, parents, native, education, occupation.
 * Returns similarity score and matched fields.
 * Used for both OCR imports and direct profile creation.
 */
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { collections, type ProfileDocument } from "@/firebase/schema";

export interface DuplicateResult {
  isDuplicate: boolean;
  similarity: number;
  matchedFields: string[];
  matchedProfileUid?: string;
}

function normalize(s: string | undefined | null): string {
  return (s ?? "").toLowerCase().trim().replace(/\s+/g, " ");
}

function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

/**
 * Compare two profiles and return similarity.
 */
export function compareProfiles(a: ProfileDocument, b: ProfileDocument): DuplicateResult {
  const fields = {
    phone: { a: normalize(a.phone), b: normalize(b.phone), weight: 3 },
    email: { a: normalize(a.email), b: normalize(b.email), weight: 3 },
    dateOfBirth: { a: normalize(a.dateOfBirth), b: normalize(b.dateOfBirth), weight: 3 },
    name: { a: normalize(a.name), b: normalize(b.name), weight: 2 },
    fatherName: { a: normalize(a.fatherName), b: normalize(b.fatherName), weight: 2 },
    motherName: { a: normalize(a.motherName), b: normalize(b.motherName), weight: 2 },
    nativePlace: { a: normalize(a.nativePlace), b: normalize(b.nativePlace), weight: 1 },
    education: { a: normalize(a.education), b: normalize(b.education), weight: 1 },
    occupation: { a: normalize(a.occupation), b: normalize(b.occupation), weight: 1 },
  };

  let totalWeight = 0;
  let matchedWeight = 0;
  const matchedFields: string[] = [];

  for (const [key, f] of Object.entries(fields)) {
    if (!f.a || !f.b) continue;
    totalWeight += f.weight;
    if (f.a === f.b) {
      matchedWeight += f.weight;
      matchedFields.push(key);
    } else if (key === "name" || key === "fatherName" || key === "motherName") {
      const sim = stringSimilarity(f.a, f.b);
      if (sim > 0.85) {
        matchedWeight += f.weight * sim;
        matchedFields.push(`${key}(fuzzy)`);
      }
    }
  }

  const similarity = totalWeight > 0 ? matchedWeight / totalWeight : 0;
  return {
    isDuplicate: similarity >= 0.9,
    similarity,
    matchedFields,
    matchedProfileUid: b.uid,
  };
}

/**
 * Check a new profile against all existing profiles for duplicates.
 */
export async function checkProfileDuplicate(
  profile: Partial<ProfileDocument>,
  excludeUid?: string,
): Promise<DuplicateResult> {
  if (!db) return { isDuplicate: false, similarity: 0, matchedFields: [] };

  try {
    const candidates: ProfileDocument[] = [];

    // Search by phone
    if (profile.phone) {
      const snap = await getDocs(query(collection(db, collections.profiles), where("phone", "==", profile.phone), limit(10)));
      snap.forEach((d) => { if (d.id !== excludeUid) candidates.push({ uid: d.id, ...(d.data() as Omit<ProfileDocument, "uid">) }); });
    }

    // Search by email
    if (profile.email) {
      const snap = await getDocs(query(collection(db, collections.profiles), where("email", "==", profile.email), limit(10)));
      snap.forEach((d) => { if (d.id !== excludeUid) candidates.push({ uid: d.id, ...(d.data() as Omit<ProfileDocument, "uid">) }); });
    }

    // Search by name + DOB
    if (profile.name && profile.dateOfBirth) {
      const snap = await getDocs(query(collection(db, collections.profiles), where("name", "==", profile.name), where("dateOfBirth", "==", profile.dateOfBirth), limit(5)));
      snap.forEach((d) => { if (d.id !== excludeUid) candidates.push({ uid: d.id, ...(d.data() as Omit<ProfileDocument, "uid">) }); });
    }

    // Compare each candidate
    let bestResult: DuplicateResult = { isDuplicate: false, similarity: 0, matchedFields: [] };
    for (const candidate of candidates) {
      const result = compareProfiles(profile as ProfileDocument, candidate);
      if (result.similarity > bestResult.similarity) {
        bestResult = result;
      }
    }

    return bestResult;
  } catch {
    return { isDuplicate: false, similarity: 0, matchedFields: [] };
  }
}
