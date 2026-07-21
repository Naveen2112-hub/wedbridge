"use client";
import type { PartialProfile, ProfileWithConfidence, FieldKey, ExtractedField } from "./ocrTypes";
import { confidenceLevel } from "./ocrTypes";
import { FIELD_PATTERNS } from "./ocrPatterns";
import { preprocessImage, type PreprocessProgress } from "./ocrPreprocess";

export type OCRProgress = (step: string, progress: number) => void;

const OCR_LANGUAGES = "eng+tam+tel+kan+hin";

function calculateConfidence(
  matchedText: string,
  baseConfidence: number,
  ocrConfidence: number,
  source: string,
): number {
  const lengthFactor = Math.min(1, matchedText.trim().length / 4);
  const ocrFactor = Math.max(0.3, ocrConfidence);
  const sourceBonus = source !== "eng" ? 0.05 : 0;
  return Math.min(1, baseConfidence * (0.6 + 0.4 * lengthFactor) * ocrFactor + sourceBonus);
}

function extractFields(
  text: string,
  ocrConfidence: number,
  source: string,
): ProfileWithConfidence {
  const result: ProfileWithConfidence = {};
  for (const field of FIELD_PATTERNS) {
    for (const re of field.patterns) {
      const m = text.match(re);
      if (m && m[1]) {
        const value = m[1].trim();
        if (!value) continue;
        const base = field.baseConfidence ?? 0.7;
        const score = calculateConfidence(value, base, ocrConfidence, source);
        const entry: ExtractedField = {
          value,
          confidence: Math.round(score * 100) / 100,
          level: confidenceLevel(score),
          source,
        };
        const existing = result[field.key];
        if (!existing || entry.confidence > existing.confidence) {
          result[field.key] = entry;
        }
        break;
      }
    }
  }
  return result;
}

function mergeResults(results: ProfileWithConfidence[]): ProfileWithConfidence {
  const merged: ProfileWithConfidence = {};
  for (const res of results) {
    for (const [key, field] of Object.entries(res)) {
      if (!field) continue;
      const existing = merged[key as FieldKey];
      if (!existing || field.confidence > existing.confidence) {
        merged[key as FieldKey] = field;
      }
    }
  }
  return merged;
}

export interface OCRResult {
  text: string;
  data: PartialProfile;
  withConfidence: ProfileWithConfidence;
}

export async function runOCR(
  file: File,
  progress?: OCRProgress,
): Promise<OCRResult> {
  const report = (step: string, p: number) => progress?.(step, p);

  report("Preprocessing image", 0.05);
  let processedBlob: Blob;
  try {
    const preprocessProgress: PreprocessProgress = (step, p) =>
      report(step, 0.05 + p * 0.35);
    processedBlob = await preprocessImage(file, preprocessProgress);
  } catch {
    report("Preprocessing failed, using original", 0.4);
    processedBlob = file;
  }

  const { default: Tesseract } = await import("tesseract.js");

  report("Running multilingual OCR", 0.45);
  const result = await Tesseract.recognize(processedBlob, OCR_LANGUAGES, {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        report("Recognizing text", 0.45 + m.progress * 0.4);
      }
    },
  });

  report("Extracting structured fields", 0.9);
  const text = result?.data?.text ?? "";
  const ocrConfidence = result?.data?.confidence ? result.data.confidence / 100 : 0.5;

  const allResults: ProfileWithConfidence[] = [];
  allResults.push(extractFields(text, ocrConfidence, "multi"));

  const merged = mergeResults(allResults);

  const data: PartialProfile = {};
  for (const [key, field] of Object.entries(merged)) {
    if (field && field.value) {
      data[key as FieldKey] = field.value;
    }
  }

  report("Complete", 1);
  return { text, data, withConfidence: merged };
}

export function extractProfile(text: string): PartialProfile {
  const withConfidence = extractFields(text, 0.5, "eng");
  const data: PartialProfile = {};
  for (const [key, field] of Object.entries(withConfidence)) {
    if (field && field.value) {
      data[key as FieldKey] = field.value;
    }
  }
  return data;
}
