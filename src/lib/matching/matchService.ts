import { collection, doc, addDoc, getDocs, query, where, updateDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type ProfileDocument, type InterestDocument } from "@/firebase/schema";
import { sanitizeText } from "@/lib/utils";

export interface MatchScore { profile: ProfileDocument; score: number; reasons: string[]; }

export async function getAIMatches(userId: string, userProfile: ProfileDocument, max = 20): Promise<MatchScore[]> {
  if (!db) return [];
  try {
    const lookingFor = userProfile.gender === "male" ? "female" : "male";
    const snap = await getDocs(query(collection(db, collections.profiles), where("status", "==", "approved"), where("gender", "==", lookingFor), limit(100)));
    const profiles = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProfileDocument, "id">) }));

    const scored = profiles.map((p) => {
      let score = 0;
      const reasons: string[] = [];
      if (p.religion === userProfile.religion) { score += 25; reasons.push("Same religion"); }
      if (p.caste === userProfile.caste) { score += 20; reasons.push("Same caste"); }
      if (p.motherTongue === userProfile.motherTongue) { score += 15; reasons.push("Same mother tongue"); }
      if (p.city === userProfile.city) { score += 15; reasons.push("Same city"); }
      if (p.education === userProfile.education) { score += 10; reasons.push("Same education level"); }
      if (p.maritalStatus === userProfile.maritalStatus) { score += 10; reasons.push("Same marital status"); }
      if (p.verified) { score += 5; reasons.push("Verified profile"); }
      return { profile: p, score, reasons };
    });

    return scored.filter((m) => m.score > 0).sort((a, b) => b.score - a.score).slice(0, max);
  } catch { return []; }
}

export async function sendInterest(fromUserId: string, fromUserName: string, toUserId: string, toProfileId: string, message?: string): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: "Database not configured." };
  try {
    const existing = await getDocs(query(collection(db, collections.interests), where("fromUserId", "==", fromUserId), where("toProfileId", "==", toProfileId), limit(1)));
    if (!existing.empty) return { ok: false, error: "Interest already sent." };
    const data: Omit<InterestDocument, "id" | "createdAt" | "updatedAt"> = {
      fromUserId, fromUserName, toUserId, toProfileId, status: "pending", message: message ? sanitizeText(message) : "",
    };
    await addDoc(collection(db, collections.interests), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as Omit<InterestDocument, "id">);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to send interest" };
  }
}

export async function getUserInterests(uid: string, max = 50): Promise<InterestDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.interests), where("toUserId", "==", uid), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<InterestDocument, "id">) }));
  } catch { return []; }
}

export async function getSentInterests(uid: string, max = 50): Promise<InterestDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.interests), where("fromUserId", "==", uid), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<InterestDocument, "id">) }));
  } catch { return []; }
}

export async function updateInterestStatus(id: string, status: "accepted" | "rejected"): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.interests, id), { status, updatedAt: serverTimestamp() }); } catch { /* ignore */ }
}
