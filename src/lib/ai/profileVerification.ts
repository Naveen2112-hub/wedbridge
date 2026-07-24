/**
 * AI Profile Verification Service
 * Detects fake profile photos, duplicate photos, AI-generated faces, edited photos.
 * Uses Gemini Vision for image analysis + heuristic checks.
 * Server-side only — uses Firebase Admin SDK.
 */
import { getDb } from "@/lib/firebase-admin";
import { collections, type ProfileDocument } from "@/firebase/schema";
import { isGeminiConfigured } from "@/lib/ocr/geminiVision";

export interface VerificationResult {
  isVerified: boolean;
  fraudScore: number;
  flags: VerificationFlag[];
  recommendation: "approve" | "review" | "reject";
  geminiAnalysis?: string;
}

export interface VerificationFlag {
  type: "fake_photo" | "duplicate_photo" | "ai_generated" | "edited_photo" | "multiple_accounts" | "low_quality" | "no_face" | "multiple_faces";
  severity: "low" | "medium" | "high";
  message: string;
}

const FRAUD_PROMPT = `Analyze this profile photo for authenticity. Check:
1. Is this an AI-generated face? (look for unnatural skin texture, asymmetric features, blurred ears/fingers)
2. Is this a stock photo or celebrity photo?
3. Is this heavily edited or filtered? (excessive smoothing, unrealistic proportions)
4. Is this a screenshot from social media?
5. How many faces are visible?
6. Is the photo quality appropriate for a matrimony profile?

Return JSON: {"isAI": boolean, "isStock": boolean, "isEdited": boolean, "isScreenshot": boolean, "faceCount": number, "quality": "high"|"medium"|"low", "confidence": number}`;

/**
 * Verify a profile photo using Gemini Vision + heuristic checks.
 */
export async function verifyProfilePhoto(
  photoURL: string,
  userId: string,
): Promise<VerificationResult> {
  const flags: VerificationFlag[] = [];
  let fraudScore = 0;

  // Check 1: Duplicate photo detection
  const dupResult = await checkDuplicatePhoto(photoURL, userId);
  if (dupResult.isDuplicate) {
    flags.push({
      type: "duplicate_photo",
      severity: "high",
      message: `Photo matches another profile${dupResult.matchedUid ? ` (${dupResult.matchedUid})` : ""}`,
    });
    fraudScore += 40;
  }

  // Check 2: Gemini Vision analysis
  let geminiAnalysis: string | undefined;
  if (isGeminiConfigured()) {
    const geminiResult = await analyzeWithGemini(photoURL);
    if (geminiResult) {
      geminiAnalysis = JSON.stringify(geminiResult);
      if (geminiResult.isAI) {
        flags.push({ type: "ai_generated", severity: "high", message: "Photo appears to be AI-generated" });
        fraudScore += 35;
      }
      if (geminiResult.isStock) {
        flags.push({ type: "fake_photo", severity: "high", message: "Photo appears to be a stock or celebrity photo" });
        fraudScore += 30;
      }
      if (geminiResult.isEdited) {
        flags.push({ type: "edited_photo", severity: "medium", message: "Photo appears heavily edited or filtered" });
        fraudScore += 15;
      }
      if (geminiResult.isScreenshot) {
        flags.push({ type: "fake_photo", severity: "medium", message: "Photo appears to be a screenshot" });
        fraudScore += 10;
      }
      if (geminiResult.faceCount === 0) {
        flags.push({ type: "no_face", severity: "medium", message: "No face detected in photo" });
        fraudScore += 15;
      }
      if (geminiResult.faceCount > 1) {
        flags.push({ type: "multiple_faces", severity: "low", message: `${geminiResult.faceCount} faces detected` });
        fraudScore += 5;
      }
      if (geminiResult.quality === "low") {
        flags.push({ type: "low_quality", severity: "low", message: "Low quality photo" });
        fraudScore += 5;
      }
    }
  }

  // Check 3: Multiple accounts with same phone/email
  const multiAccount = await checkMultipleAccounts(userId);
  if (multiAccount) {
    flags.push({ type: "multiple_accounts", severity: "high", message: "Multiple accounts detected with same contact info" });
    fraudScore += 30;
  }

  fraudScore = Math.min(fraudScore, 100);

  const recommendation: VerificationResult["recommendation"] =
    fraudScore >= 60 ? "reject" : fraudScore >= 30 ? "review" : "approve";

  return {
    isVerified: fraudScore < 20 && flags.length === 0,
    fraudScore,
    flags,
    recommendation,
    geminiAnalysis,
  };
}

async function checkDuplicatePhoto(
  photoURL: string,
  currentUserId: string,
): Promise<{ isDuplicate: boolean; matchedUid?: string }> {
  try {
    const db = getDb();
    const snap = await db.collection(collections.profiles).where("photoURL", "==", photoURL).limit(5).get();
    for (const doc of snap.docs) {
      if (doc.id !== currentUserId) {
        return { isDuplicate: true, matchedUid: doc.id };
      }
    }
  } catch { /* ignore */ }
  return { isDuplicate: false };
}

async function analyzeWithGemini(photoURL: string): Promise<{
  isAI: boolean; isStock: boolean; isEdited: boolean; isScreenshot: boolean;
  faceCount: number; quality: string; confidence: number;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageRes = await fetch(photoURL);
    if (!imageRes.ok) return null;
    const buffer = Buffer.from(await imageRes.arrayBuffer());

    const result = await model.generateContent([
      FRAUD_PROMPT,
      { inlineData: { data: buffer.toString("base64"), mimeType: "image/jpeg" } },
    ]);
    const text = result.response.text();
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function checkMultipleAccounts(userId: string): Promise<boolean> {
  try {
    const db = getDb();
    const userSnap = await db.collection(collections.users).where("uid", "==", userId).limit(1).get();
    if (userSnap.empty) return false;
    const userData = userSnap.docs[0].data() as { phone?: string; email?: string };
    if (!userData.phone && !userData.email) return false;

    const byPhone = userData.phone
      ? await db.collection(collections.users).where("phone", "==", userData.phone).limit(5).get()
      : { size: 0 };
    const byEmail = userData.email
      ? await db.collection(collections.users).where("email", "==", userData.email).limit(5).get()
      : { size: 0 };

    return (byPhone.size > 1 || byEmail.size > 1);
  } catch {
    return false;
  }
}

/**
 * Batch verify all unverified profiles (for admin use).
 */
export async function batchVerifyProfiles(): Promise<{ verified: number; flagged: number; errors: number }> {
  try {
    const db = getDb();
    const snap = await db.collection(collections.profiles).where("verificationStatus", "==", "unverified").limit(50).get();
    let verified = 0, flagged = 0, errors = 0;
    for (const doc of snap.docs) {
      const profile = doc.data() as ProfileDocument;
      if (!profile.photoURL) continue;
      try {
        const result = await verifyProfilePhoto(profile.photoURL, doc.id);
        if (result.isVerified) verified++;
        else flagged++;
      } catch {
        errors++;
      }
    }
    return { verified, flagged, errors };
  } catch {
    return { verified: 0, flagged: 0, errors: 0 };
  }
}
