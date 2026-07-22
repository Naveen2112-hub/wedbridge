import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, getDoc, deleteDoc, serverTimestamp, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type ProfileDocument, type AiMatchDocument, type MatchHistoryDocument, type MembershipTier } from "@/firebase/schema";
import { calculateAge } from "@/lib/format";
import { calculateCompatibility, type CompatibilityResult } from "@/lib/ai/compatibilityEngine";

export const FREE_DAILY_LIMIT = 20;
export const REFRESH_HOURS = 24;

export interface AiMatchFilters {
  minScore?: number;
  minAge?: number;
  maxAge?: number;
  district?: string;
  religion?: string;
  caste?: string;
  premium?: boolean;
  verified?: boolean;
}

export type AiTab = "top" | "today" | "recent" | "near" | "educated" | "premium" | "active";

export interface ScoredMatch {
  profile: ProfileDocument;
  score: number;
  reasons: string[];
  insights: string[];
  compatibility?: CompatibilityResult;
}

interface FactorWeights {
  religion: number; caste: number; age: number; education: number; occupation: number;
  district: number; motherTongue: number; lifestyle: number; food: number; horoscope: number;
  maritalStatus: number; state: number; country: number; income: number; height: number;
  smoking: number; drinking: number; star: number; rasi: number; manglik: number; partnerPref: number;
}

const WEIGHTS: FactorWeights = {
  religion: 20, caste: 15, age: 15, education: 10, occupation: 10, district: 10,
  motherTongue: 10, lifestyle: 5, food: 5, horoscope: 10, maritalStatus: 5, state: 5,
  country: 5, income: 5, height: 5, smoking: 3, drinking: 3, star: 5, rasi: 5, manglik: 5, partnerPref: 10,
};

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

function ageDiffScore(a: number, b: number): number {
  const diff = Math.abs(a - b);
  if (diff <= 2) return 1;
  if (diff <= 5) return 0.8;
  if (diff <= 8) return 0.5;
  if (diff <= 12) return 0.3;
  return 0;
}

function matchScore(a: string | undefined | null, b: string | undefined | null): number {
  if (!a || !b) return 0;
  return a.toLowerCase() === b.toLowerCase() ? 1 : 0;
}

export function calculateAiScore(user: ProfileDocument, candidate: ProfileDocument): { score: number; reasons: string[]; insights: string[]; compatibility: CompatibilityResult } {
  const compatibility = calculateCompatibility(user, candidate);
  const { overallScore, strengths, weaknesses, conversationStarters } = compatibility;

  const reasons: string[] = strengths.map((s) => s);
  const insights: string[] = weaknesses.map((w) => w);

  // Map conversation starters to insights
  if (conversationStarters.length > 0) {
    insights.push(...conversationStarters);
  }

  return { score: overallScore, reasons, insights, compatibility };
}

function isProfileSearchable(p: ProfileDocument): boolean {
  if (p.profileVisibility === "hidden") return false;
  if (p.accountStatus === "deactivated") return false;
  return true;
}

export async function generateAiMatches(user: ProfileDocument, max = 50): Promise<ScoredMatch[]> {
  if (!db) return [];
  try {
    const targetGender = user.gender === "male" ? "female" : user.gender === "female" ? "male" : null;
    let q;
    if (targetGender) {
      q = query(collection(db, collections.profiles), where("gender", "==", targetGender), limit(100));
    } else {
      q = query(collection(db, collections.profiles), limit(100));
    }
    const snap = await getDocs(q);
    const candidates: ProfileDocument[] = [];
    snap.forEach((d) => { if (d.id !== user.uid) { const p = { uid: d.id, ...(d.data() as Omit<ProfileDocument, "uid">) }; if (isProfileSearchable(p)) candidates.push(p); } });
    const scored = candidates.map((c) => { const { score, reasons, insights, compatibility } = calculateAiScore(user, c); return { profile: c, score, reasons, insights, compatibility }; });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, max);
  } catch {
    return [];
  }
}

function isCacheFresh(generatedAt: unknown): boolean {
  if (!generatedAt) return false;
  let ms: number;
  if (typeof generatedAt === "number") ms = generatedAt;
  else if (typeof generatedAt === "object" && generatedAt && "toMillis" in generatedAt && typeof (generatedAt as { toMillis: () => number }).toMillis === "function") ms = (generatedAt as { toMillis: () => number }).toMillis();
  else return false;
  return Date.now() - ms < REFRESH_HOURS * 60 * 60 * 1000;
}

export async function getCachedMatches(uid: string): Promise<ScoredMatch[] | null> {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, collections.aiMatches), where("uid", "==", uid), orderBy("score", "desc"), limit(50)));
    if (snap.empty) return null;
    const first = snap.docs[0].data() as AiMatchDocument;
    if (!isCacheFresh(first.generatedAt)) return null;
    const matches: ScoredMatch[] = [];
    for (const d of snap.docs) {
      const data = d.data() as AiMatchDocument;
      const pSnap = await getDoc(doc(db, collections.profiles, data.profileUid));
      if (pSnap.exists()) {
        const profile = { uid: pSnap.id, ...(pSnap.data() as Omit<ProfileDocument, "uid">) };
        if (isProfileSearchable(profile)) matches.push({ profile, score: data.score, reasons: data.reasons ?? [], insights: data.insights ?? [], compatibility: data.breakdown ? { overallScore: data.score, breakdown: data.breakdown, strengths: data.strengths ?? [], weaknesses: data.weaknesses ?? [], conversationStarters: data.conversationStarters ?? [] } : undefined });
      }
    }
    return matches;
  } catch {
    return null;
  }
}

export async function saveCachedMatches(uid: string, matches: ScoredMatch[]): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    const existing = await getDocs(query(collection(database, collections.aiMatches), where("uid", "==", uid)));
    await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));
    const now = serverTimestamp();
    await Promise.all(matches.map((m) => addDoc(collection(database, collections.aiMatches), {
      uid, profileUid: m.profile.uid, score: m.score, reasons: m.reasons, insights: m.insights,
      breakdown: m.compatibility?.breakdown, strengths: m.compatibility?.strengths, weaknesses: m.compatibility?.weaknesses, conversationStarters: m.compatibility?.conversationStarters,
      generatedAt: now,
    } as Omit<AiMatchDocument, "id">)));
  } catch { /* ignore */ }
}

export function filterMatches(matches: ScoredMatch[], filters: AiMatchFilters): ScoredMatch[] {
  const f = filters || {};
  return matches.filter((m) => {
    if (f.minScore !== undefined && m.score < f.minScore) return false;
    if (f.district && m.profile.district !== f.district) return false;
    if (f.religion && m.profile.religion !== f.religion) return false;
    if (f.caste && m.profile.caste !== f.caste) return false;
    if (f.premium && (!m.profile.membership || m.profile.membership === "free")) return false;
    if (f.verified && m.profile.verificationStatus !== "verified") return false;
    if (f.minAge !== undefined || f.maxAge !== undefined) {
      if (!m.profile.dateOfBirth) return false;
      const age = calculateAge(m.profile.dateOfBirth);
      if (f.minAge !== undefined && age < f.minAge) return false;
      if (f.maxAge !== undefined && age > f.maxAge) return false;
    }
    return true;
  });
}

export function applyTab(matches: ScoredMatch[], tab: AiTab, user: ProfileDocument): ScoredMatch[] {
  const sorted = [...matches];
  switch (tab) {
    case "top": return sorted.sort((a, b) => b.score - a.score);
    case "today": return sorted.filter((m) => m.score >= 70).sort((a, b) => b.score - a.score);
    case "recent": {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return sorted.filter((m) => {
        const created = m.profile.createdAt as unknown as { toMillis?: () => number } | number | null;
        const ms = typeof created === "number" ? created : created?.toMillis?.() ?? 0;
        return ms >= thirtyDaysAgo;
      }).sort((a, b) => b.score - a.score);
    }
    case "near": return sorted.filter((m) => m.profile.district === user.district).sort((a, b) => b.score - a.score);
    case "educated": return sorted.filter((m) => Boolean(m.profile.education)).sort((a, b) => b.score - a.score);
    case "premium": return sorted.filter((m) => m.profile.membership && m.profile.membership !== "free").sort((a, b) => b.score - a.score);
    case "active": {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return sorted.filter((m) => {
        const la = m.profile.lastActiveAt as unknown as { toMillis?: () => number } | number | null;
        const ms = typeof la === "number" ? la : la?.toMillis?.() ?? 0;
        return ms >= dayAgo || m.profile.online === true;
      }).sort((a, b) => b.score - a.score);
    }
    default: return sorted;
  }
}

export function limitByMembership(matches: ScoredMatch[], membership: MembershipTier | undefined): ScoredMatch[] {
  if (membership && membership !== "free") return matches;
  return matches.slice(0, FREE_DAILY_LIMIT);
}

export async function recordMatchAction(uid: string, profileUid: string, score: number, action: MatchHistoryDocument["action"]): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await addDoc(collection(database, collections.matchHistory), {
      uid, profileUid, score, action, createdAt: serverTimestamp(),
    } as Omit<MatchHistoryDocument, "id">);
  } catch { /* ignore */ }
}

export async function getMatchHistory(uid: string, max = 20): Promise<MatchHistoryDocument[]> {
  if (!db) return [];
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.matchHistory), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max)));
    const items: MatchHistoryDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<MatchHistoryDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}

export type { DocumentData, QueryDocumentSnapshot };
