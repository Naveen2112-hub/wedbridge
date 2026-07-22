/**
 * Biodata import service: download from Telegram, dedup, store in Firestore.
 * Enhanced with multi-field duplicate detection, analytics, security, auto-calculate.
 */
import { db } from "@/firebase/config";
import {
  collection, addDoc, doc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, orderBy, limit,
} from "firebase/firestore";
import { collections, type AppUser } from "@/firebase/schema";
import { processBiodataFile, stripHoroscopeFields, type TelegramOCRResult } from "@/lib/ocr/telegramOCR";
import { calculateCompletion, getMissingFields, calculateAge } from "@/lib/ocr/fieldValidator";
import { isValidMime, isSafeFile } from "@/lib/ocr/fileTypeDetection";
import { escapeMarkdown } from "@/lib/telegram-client";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

export type ImportStatus = "pending_review" | "approved" | "rejected" | "duplicate" | "failed_ocr";

export interface OcrImportRecord {
  id?: string;
  telegramChatId: string;
  telegramUserId?: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  originalFileUrl?: string;
  extractedData: Record<string, string>;
  ocrConfidence: number;
  ocrText: string;
  status: ImportStatus;
  profilePhotoUrl?: string;
  importTime?: unknown;
  reviewedBy?: string;
  reviewedAt?: unknown;
  duplicateOf?: string;
  duplicateSimilarity?: number;
  duplicateMatchedFields?: string[];
  corrections?: string[];
  completionPercentage?: number;
  missingFields?: string[];
  processingTimeMs?: number;
  ocrSource?: string;
  fileAnalysis?: {
    type: string;
    isScanned: boolean;
    quality: string;
    needsPreprocessing: boolean;
    width: number;
    height: number;
  };
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateId?: string;
  similarity: number;
  matchedFields: string[];
}

/**
 * Download a file from Telegram using getFile API.
 */
export async function downloadTelegramFile(
  token: string,
  fileId: string,
): Promise<{ buffer: Buffer; fileName: string; mimeType: string; fileSize: number }> {
  const fileRes = await fetch(`${TELEGRAM_API_BASE}${token}/getFile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });
  const fileData = await fileRes.json();
  if (!fileData.ok) throw new Error(fileData.description ?? "getFile failed");

  const filePath = fileData.result.file_path as string;
  const fileSize = fileData.result.file_size as number;

  const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const dlRes = await fetch(downloadUrl);
  if (!dlRes.ok) throw new Error(`Download failed: ${dlRes.status}`);

  const arrayBuffer = await dlRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = filePath.split("/").pop() ?? "unknown";
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const mimeType =
    ext === "pdf" ? "application/pdf" :
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
    ext === "png" ? "image/png" :
    ext === "webp" ? "image/webp" :
    "application/octet-stream";

  return { buffer, fileName, mimeType, fileSize: fileSize ?? buffer.length };
}

/**
 * Multi-field duplicate detection comparing phone, email, DOB, name, native, education, occupation.
 */
export async function checkDuplicate(
  extractedData: Record<string, string>,
): Promise<DuplicateCheckResult> {
  if (!db) return { isDuplicate: false, similarity: 0, matchedFields: [] };

  const fields = {
    phone: extractedData.phone?.trim(),
    whatsapp: extractedData.whatsapp?.trim(),
    email: extractedData.email?.trim().toLowerCase(),
    name: extractedData.name?.trim().toLowerCase(),
    dateOfBirth: extractedData.dateOfBirth?.trim() || extractedData.dob?.trim(),
    nativePlace: extractedData.nativePlace?.trim().toLowerCase(),
    education: extractedData.education?.trim().toLowerCase(),
    occupation: extractedData.occupation?.trim().toLowerCase(),
    fatherName: extractedData.fatherName?.trim().toLowerCase(),
    motherName: extractedData.motherName?.trim().toLowerCase(),
  };

  try {
    const importsRef = collection(db, collections.ocrImports);
    const approvedQ = query(importsRef, where("status", "in", ["approved", "pending_review"]));
    const snap = await getDocs(approvedQ);

    for (const docSnap of snap.docs) {
      const existing = docSnap.data() as OcrImportRecord;
      const exData = existing.extractedData ?? {};
      let matches = 0;
      let totalFields = 0;
      const matchedFields: string[] = [];

      // Phone (high weight)
      if (fields.phone && exData.phone?.trim() === fields.phone) {
        matches += 2; totalFields += 2; matchedFields.push("phone");
      } else if (fields.phone) totalFields += 2;

      // WhatsApp
      if (fields.whatsapp && exData.whatsapp?.trim() === fields.whatsapp) {
        matches += 2; totalFields += 2; matchedFields.push("whatsapp");
      } else if (fields.whatsapp) totalFields += 2;

      // Email (high weight)
      if (fields.email && exData.email?.trim().toLowerCase() === fields.email) {
        matches += 2; totalFields += 2; matchedFields.push("email");
      } else if (fields.email) totalFields += 2;

      // Name (fuzzy)
      if (fields.name && exData.name?.trim().toLowerCase() === fields.name) {
        matches += 2; totalFields += 2; matchedFields.push("name");
      } else if (fields.name) {
        const similarity = stringSimilarity(fields.name, exData.name?.trim().toLowerCase() ?? "");
        if (similarity > 0.85) { matches += 1; matchedFields.push("name(fuzzy)"); }
        totalFields += 2;
      }

      // DOB
      if (fields.dateOfBirth && (exData.dateOfBirth?.trim() === fields.dateOfBirth || exData.dob?.trim() === fields.dateOfBirth)) {
        matches += 2; totalFields += 2; matchedFields.push("dob");
      } else if (fields.dateOfBirth) totalFields += 2;

      // Native place
      if (fields.nativePlace && exData.nativePlace?.trim().toLowerCase() === fields.nativePlace) {
        matches += 1; totalFields += 1; matchedFields.push("nativePlace");
      } else if (fields.nativePlace) totalFields += 1;

      // Education
      if (fields.education && exData.education?.trim().toLowerCase() === fields.education) {
        matches += 1; totalFields += 1; matchedFields.push("education");
      } else if (fields.education) totalFields += 1;

      // Occupation
      if (fields.occupation && exData.occupation?.trim().toLowerCase() === fields.occupation) {
        matches += 1; totalFields += 1; matchedFields.push("occupation");
      } else if (fields.occupation) totalFields += 1;

      // Father's name
      if (fields.fatherName && exData.fatherName?.trim().toLowerCase() === fields.fatherName) {
        matches += 1; totalFields += 1; matchedFields.push("fatherName");
      } else if (fields.fatherName) totalFields += 1;

      // Mother's name
      if (fields.motherName && exData.motherName?.trim().toLowerCase() === fields.motherName) {
        matches += 1; totalFields += 1; matchedFields.push("motherName");
      } else if (fields.motherName) totalFields += 1;

      if (totalFields === 0) continue;
      const similarity = matches / totalFields;
      if (similarity >= 0.9) {
        return { isDuplicate: true, duplicateId: docSnap.id, similarity, matchedFields };
      }
    }
  } catch {
    // best-effort
  }

  return { isDuplicate: false, similarity: 0, matchedFields: [] };
}

/**
 * Simple string similarity using Levenshtein distance.
 */
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
 * Store an import record in Firestore.
 */
export async function storeImport(
  record: Omit<OcrImportRecord, "id" | "importTime">,
): Promise<{ id: string }> {
  if (!db) throw new Error("Database unavailable");
  const docRef = await addDoc(collection(db, collections.ocrImports), {
    ...record,
    importTime: serverTimestamp(),
  });
  return { id: docRef.id };
}

/**
 * Full pipeline: download, validate, OCR, clean, dedup, store, reply.
 */
export async function processBiodataImport(
  token: string,
  chatId: string,
  fileId: string,
  telegramUserId?: number,
): Promise<{
  success: boolean;
  importId?: string;
  status: ImportStatus;
  ocrResult?: TelegramOCRResult;
  duplicateInfo?: DuplicateCheckResult;
  error?: string;
}> {
  try {
    // Step 1-2: Download file
    const { buffer, fileName, mimeType, fileSize } = await downloadTelegramFile(token, fileId);

    // Step 18: Security validation
    if (!isValidMime(mimeType, fileName)) {
      await sendText(token, chatId, "❌ Unsupported file type. Please send a PDF, JPG, or PNG file.");
      return { success: false, status: "failed_ocr", error: "Invalid MIME type" };
    }
    if (!isSafeFile(buffer, mimeType)) {
      await sendText(token, chatId, "❌ File failed security validation. Please send a valid biodata file.");
      return { success: false, status: "failed_ocr", error: "Security validation failed" };
    }

    // Steps 3-10: OCR + AI cleaning + validation
    const ocrResult = await processBiodataFile(buffer, mimeType, fileName);
    const cleanedData = stripHoroscopeFields(ocrResult.data);

    // Step 9: Auto-calculate age
    const dataWithAge = { ...cleanedData };
    if (dataWithAge.dateOfBirth && !dataWithAge.age) {
      const age = calculateAge(dataWithAge.dateOfBirth);
      if (age !== null) dataWithAge.age = String(age);
    }

    // Step 11-12: Duplicate detection
    const dupCheck = await checkDuplicate(dataWithAge as Record<string, string>);
    if (dupCheck.isDuplicate) {
      const { id } = await storeImport({
        telegramChatId: chatId,
        telegramUserId,
        fileName,
        fileType: mimeType,
        fileSize,
        extractedData: dataWithAge as Record<string, string>,
        ocrConfidence: ocrResult.confidence,
        ocrText: ocrResult.text,
        status: "duplicate",
        duplicateOf: dupCheck.duplicateId,
        duplicateSimilarity: dupCheck.similarity,
        duplicateMatchedFields: dupCheck.matchedFields,
        corrections: ocrResult.corrections,
        completionPercentage: calculateCompletion(dataWithAge as Record<string, string>),
        missingFields: getMissingFields(dataWithAge as Record<string, string>),
        processingTimeMs: ocrResult.processingTimeMs,
        ocrSource: ocrResult.source,
        fileAnalysis: {
          type: ocrResult.fileAnalysis.type,
          isScanned: ocrResult.fileAnalysis.isScanned,
          quality: ocrResult.fileAnalysis.quality,
          needsPreprocessing: ocrResult.fileAnalysis.needsPreprocessing,
          width: ocrResult.fileAnalysis.width,
          height: ocrResult.fileAnalysis.height,
        },
      });

      await notifyAdminDuplicate(token, chatId, id, dupCheck);
      return { success: false, importId: id, status: "duplicate", ocrResult, duplicateInfo: dupCheck };
    }

    // Step 13: Store import
    const { id } = await storeImport({
      telegramChatId: chatId,
      telegramUserId,
      fileName,
      fileType: mimeType,
      fileSize,
      extractedData: dataWithAge as Record<string, string>,
      ocrConfidence: ocrResult.confidence,
      ocrText: ocrResult.text,
      status: "pending_review",
      corrections: ocrResult.corrections,
      completionPercentage: calculateCompletion(dataWithAge as Record<string, string>),
      missingFields: getMissingFields(dataWithAge as Record<string, string>),
      processingTimeMs: ocrResult.processingTimeMs,
      ocrSource: ocrResult.source,
      fileAnalysis: {
        type: ocrResult.fileAnalysis.type,
        isScanned: ocrResult.fileAnalysis.isScanned,
        quality: ocrResult.fileAnalysis.quality,
        needsPreprocessing: ocrResult.fileAnalysis.needsPreprocessing,
        width: ocrResult.fileAnalysis.width,
        height: ocrResult.fileAnalysis.height,
      },
    });

    // Step 10-11: Reply to user
    await sendImportReply(token, chatId, id, ocrResult.confidence, dataWithAge as Record<string, string>);

    return { success: true, importId: id, status: "pending_review", ocrResult };
  } catch (e) {
    try {
      await storeImport({
        telegramChatId: chatId,
        telegramUserId,
        fileName: "unknown",
        fileType: "unknown",
        fileSize: 0,
        extractedData: {},
        ocrConfidence: 0,
        ocrText: "",
        status: "failed_ocr",
      });
    } catch {
      // ignore
    }

    return {
      success: false,
      status: "failed_ocr",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/**
 * Send success reply to Telegram user.
 */
async function sendImportReply(
  token: string,
  chatId: string,
  importId: string,
  confidence: number,
  data: Record<string, string>,
): Promise<void> {
  const completionPct = Math.round(calculateCompletion(data));
  const confidencePct = Math.round(confidence * 100);
  const needsReview = confidencePct < 80;

  const lines: string[] = [];
  lines.push(escapeMarkdown("✅ Biodata Imported"));
  lines.push("");
  lines.push(escapeMarkdown(`Completion: ${completionPct}%`));
  lines.push(escapeMarkdown(`Confidence: ${confidencePct}%`));
  if (needsReview) {
    lines.push("");
    lines.push(escapeMarkdown("⚠ Some fields need manual review."));
  }
  lines.push("");
  lines.push(escapeMarkdown("Tap below to finish profile:"));
  const replyText = lines.join("\n");

  const inlineKeyboard = {
    inline_keyboard: [[{
      text: "Complete Profile",
      url: `https://wedbridge.in/complete-profile?id=${importId}`,
    }]],
  };

  await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: replyText,
      reply_markup: inlineKeyboard,
    }),
  });
}

/**
 * Notify admin about a duplicate import.
 */
async function notifyAdminDuplicate(
  token: string,
  chatId: string,
  importId: string,
  dupInfo: DuplicateCheckResult,
): Promise<void> {
  const text = [
    escapeMarkdown("⚠ Duplicate Profile Detected"),
    "",
    escapeMarkdown(`Matched on: ${dupInfo.matchedFields.join(", ")}`),
    escapeMarkdown(`Similarity: ${Math.round(dupInfo.similarity * 100)}%`),
    escapeMarkdown(`Import ID: ${importId}`),
  ].join("\n");

  await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

/**
 * Get all imports for admin dashboard.
 */
export async function getImports(
  statusFilter?: ImportStatus,
): Promise<OcrImportRecord[]> {
  if (!db) return [];
  try {
    const ref = collection(db, collections.ocrImports);
    const q = statusFilter
      ? query(ref, where("status", "==", statusFilter), orderBy("importTime", "desc"), limit(100))
      : query(ref, orderBy("importTime", "desc"), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as OcrImportRecord);
  } catch {
    return [];
  }
}

/**
 * Update import status (approve/reject) and optionally edit extracted data.
 */
export async function updateImportStatus(
  importId: string,
  status: ImportStatus,
  reviewedBy: string,
  extractedData?: Record<string, string>,
): Promise<void> {
  if (!db) return;
  const update: Record<string, unknown> = {
    status,
    reviewedBy,
    reviewedAt: serverTimestamp(),
  };
  if (extractedData) update.extractedData = extractedData;
  await updateDoc(doc(db, collections.ocrImports, importId), update);
}

/**
 * Get a single import by ID.
 */
export async function getImportById(importId: string): Promise<OcrImportRecord | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, collections.ocrImports, importId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as OcrImportRecord;
}

/**
 * Save Telegram chat ID to user profile.
 */
export async function saveChatIdToUser(
  userId: string,
  chatId: string,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, collections.users, userId), {
    telegramChatId: chatId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Find user by Telegram chat ID.
 */
export async function findUserByChatId(
  chatId: string,
): Promise<AppUser | null> {
  if (!db) return null;
  try {
    const q = query(collection(db, collections.users), where("telegramChatId", "==", chatId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as AppUser;
  } catch {
    return null;
  }
}

async function sendText(token: string, chatId: string, text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {
    // best-effort
  }
}
