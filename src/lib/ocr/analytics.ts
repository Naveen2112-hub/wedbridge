/**
 * OCR Analytics: success rate, average confidence, duplicate rate, common errors, processing time.
 * Server-side only — uses Firebase Admin SDK.
 */
import { getDb } from "@/lib/firebase-admin";
import { collections } from "@/firebase/schema";

export interface OcrAnalytics {
  totalImports: number;
  successCount: number;
  failedCount: number;
  duplicateCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  successRate: number;
  duplicateRate: number;
  averageConfidence: number;
  averageProcessingTimeMs: number;
  commonErrors: { error: string; count: number }[];
  fieldAccuracy: { field: string; averageConfidence: number; count: number }[];
}

/**
 * Calculate analytics from OCR imports.
 */
export async function getOcrAnalytics(): Promise<OcrAnalytics> {
  try {
    const database = getDb();
    const snap = await database.collection(collections.ocrImports).orderBy("importTime", "desc").limit(500).get();
    const imports = snap.docs.map((d) => d.data() as Record<string, unknown>);

    const total = imports.length;
    if (total === 0) return emptyAnalytics();

    let success = 0, failed = 0, duplicate = 0, pending = 0, approved = 0, rejected = 0;
    let confidenceSum = 0;
    let processingTimeSum = 0;
    let processingCount = 0;
    const errorCounts: Record<string, number> = {};
    const fieldConfidence: Record<string, { sum: number; count: number }> = {};

    for (const imp of imports) {
      const status = imp.status as string;
      if (status === "approved") { approved++; success++; }
      else if (status === "pending_review") { pending++; success++; }
      else if (status === "rejected") { rejected++; }
      else if (status === "duplicate") { duplicate++; }
      else if (status === "failed_ocr") { failed++; }

      const conf = imp.ocrConfidence as number;
      if (typeof conf === "number" && conf > 0) confidenceSum += conf;

      const procTime = imp.processingTimeMs as number;
      if (typeof procTime === "number" && procTime > 0) {
        processingTimeSum += procTime;
        processingCount++;
      }

      if (status === "failed_ocr") {
        const err = (imp.error as string) ?? "Unknown error";
        const errKey = err.slice(0, 80);
        errorCounts[errKey] = (errorCounts[errKey] ?? 0) + 1;
      }

      const extracted = imp.extractedData as Record<string, string> | undefined;
      if (extracted) {
        for (const [key, value] of Object.entries(extracted)) {
          if (value && typeof value === "string") {
            if (!fieldConfidence[key]) fieldConfidence[key] = { sum: 0, count: 0 };
            fieldConfidence[key].sum += conf;
            fieldConfidence[key].count++;
          }
        }
      }
    }

    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const fieldAccuracy = Object.entries(fieldConfidence)
      .map(([field, { sum, count }]) => ({
        field,
        averageConfidence: count > 0 ? sum / count : 0,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return {
      totalImports: total,
      successCount: success,
      failedCount: failed,
      duplicateCount: duplicate,
      pendingCount: pending,
      approvedCount: approved,
      rejectedCount: rejected,
      successRate: total > 0 ? success / total : 0,
      duplicateRate: total > 0 ? duplicate / total : 0,
      averageConfidence: success > 0 ? confidenceSum / success : 0,
      averageProcessingTimeMs: processingCount > 0 ? processingTimeSum / processingCount : 0,
      commonErrors,
      fieldAccuracy,
    };
  } catch {
    return emptyAnalytics();
  }
}

function emptyAnalytics(): OcrAnalytics {
  return {
    totalImports: 0, successCount: 0, failedCount: 0, duplicateCount: 0,
    pendingCount: 0, approvedCount: 0, rejectedCount: 0,
    successRate: 0, duplicateRate: 0, averageConfidence: 0,
    averageProcessingTimeMs: 0, commonErrors: [], fieldAccuracy: [],
  };
}
