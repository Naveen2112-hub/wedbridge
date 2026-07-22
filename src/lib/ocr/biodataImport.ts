/**
 * Biodata import service: download from Telegram, dedup, store in Firestore.
 */
import { db } from "@/firebase/config";
import {
  collection, addDoc, doc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, orderBy, limit,
} from "firebase/firestore";
import { collections, type AppUser } from "@/firebase/schema";
import { processBiodataFile, stripHoroscopeFields, type TelegramOCRResult } from "@/lib/ocr/telegramOCR";
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
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateId?: string;
  similarity: number;
  matchedField?: string;
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
    "application/octet-stream";

  return { buffer, fileName, mimeType, fileSize: fileSize ?? buffer.length };
}

/**
 * Check for duplicate profiles by comparing phone, email, DOB, and name.
 */
export async function checkDuplicate(
  extractedData: Record<string, string>,
): Promise<DuplicateCheckResult> {
  if (!db) return { isDuplicate: false, similarity: 0 };

  const phone = extractedData.phone?.trim();
  const email = extractedData.email?.trim();
  const name = extractedData.name?.trim().toLowerCase();
  const dob = extractedData.dateOfBirth?.trim() || extractedData.dob?.trim();

  try {
    const importsRef = collection(db, collections.ocrImports);
    const approvedQ = query(importsRef, where("status", "in", ["approved", "pending_review"]));
    const snap = await getDocs(approvedQ);

    for (const docSnap of snap.docs) {
      const existing = docSnap.data() as OcrImportRecord;
      const exData = existing.extractedData ?? {};
      let matches = 0;
      let totalFields = 0;
      let matchedField = "";

      if (phone && exData.phone?.trim() === phone) { matches++; totalFields++; matchedField = "phone"; }
      else if (phone) totalFields++;

      if (email && exData.email?.trim() === email) { matches++; totalFields++; matchedField = matchedField || "email"; }
      else if (email) totalFields++;

      if (dob && (exData.dateOfBirth?.trim() === dob || exData.dob?.trim() === dob)) { matches++; totalFields++; matchedField = matchedField || "dob"; }
      else if (dob) totalFields++;

      if (name && exData.name?.trim().toLowerCase() === name) { matches++; totalFields++; matchedField = matchedField || "name"; }
      else if (name) totalFields++;

      if (totalFields === 0) continue;
      const similarity = matches / totalFields;
      if (similarity >= 0.9 && matches >= 2) {
        return { isDuplicate: true, duplicateId: docSnap.id, similarity, matchedField };
      }
      if (similarity >= 0.9 && matches >= 1 && totalFields === 1) {
        return { isDuplicate: true, duplicateId: docSnap.id, similarity, matchedField };
      }
    }
  } catch {
    // best-effort
  }

  return { isDuplicate: false, similarity: 0 };
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
 * Full pipeline: download, OCR, clean, dedup, store, reply.
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

    // Step 3-5: OCR + AI cleaning (horoscope/border removal handled in preprocess)
    const ocrResult = await processBiodataFile(buffer, mimeType, fileName);
    const cleanedData = stripHoroscopeFields(ocrResult.data);

    // Step 8: Duplicate detection
    const dupCheck = await checkDuplicate(cleanedData as Record<string, string>);
    if (dupCheck.isDuplicate) {
      // Store as duplicate
      const { id } = await storeImport({
        telegramChatId: chatId,
        telegramUserId,
        fileName,
        fileType: mimeType,
        fileSize,
        extractedData: cleanedData as Record<string, string>,
        ocrConfidence: ocrResult.confidence,
        ocrText: ocrResult.text,
        status: "duplicate",
        duplicateOf: dupCheck.duplicateId,
      });

      // Notify admin
      await notifyAdminDuplicate(token, chatId, id, dupCheck);

      return { success: false, importId: id, status: "duplicate", ocrResult, duplicateInfo: dupCheck };
    }

    // Step 9: Store
    const { id } = await storeImport({
      telegramChatId: chatId,
      telegramUserId,
      fileName,
      fileType: mimeType,
      fileSize,
      extractedData: cleanedData as Record<string, string>,
      ocrConfidence: ocrResult.confidence,
      ocrText: ocrResult.text,
      status: "pending_review",
    });

    // Step 10-11: Reply to user
    await sendImportReply(token, chatId, id, ocrResult.confidence, cleanedData);

    return { success: true, importId: id, status: "pending_review", ocrResult };
  } catch (e) {
    // Store failed import
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
    escapeMarkdown(`Matched on: ${dupInfo.matchedField ?? "unknown"}`),
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
 * Calculate profile completion percentage based on filled fields.
 */
function calculateCompletion(data: Record<string, string>): number {
  const importantFields = [
    "name", "dateOfBirth", "age", "height", "religion", "caste",
    "education", "occupation", "phone", "email", "address",
    "fatherName", "motherName", "siblings", "nativePlace",
  "subCaste", "annualIncome",
  ];
  let filled = 0;
  for (const field of importantFields) {
    if (data[field] && data[field].trim()) filled++;
  }
  return (filled / importantFields.length) * 100;
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
 * Update import status (approve/reject).
 */
export async function updateImportStatus(
  importId: string,
  status: ImportStatus,
  reviewedBy: string,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, collections.ocrImports, importId), {
    status,
    reviewedBy,
    reviewedAt: serverTimestamp(),
  });
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
