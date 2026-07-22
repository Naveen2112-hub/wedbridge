"use client";
import type { PartialProfile, ProfileWithConfidence } from "./ocrTypes";
import { preprocessImage, type PreprocessProgress } from "./ocrPreprocess";
import { parseBiodata, withConfidenceToProfile } from "./ocrParser";
import { sendNotification } from "@/lib/telegram-notifications";

export type OCRProgress = (step: string, progress: number) => void;

const OCR_LANGUAGES = "eng+tam";

export interface OCRResult {
  text: string;
  data: PartialProfile;
  withConfidence: ProfileWithConfidence;
}

export async function runOCR(
  file: File,
  progress?: OCRProgress,
  existing?: ProfileWithConfidence,
): Promise<OCRResult> {
  const report = (step: string, p: number) => progress?.(step, p);

  report("Uploading", 0.02);

  report("Preprocessing", 0.05);
  let processedBlob: Blob;
  try {
    const preprocessProgress: PreprocessProgress = (step, p) =>
      report(step, 0.05 + p * 0.40);
    processedBlob = await preprocessImage(file, preprocessProgress);
  } catch {
    report("Preprocessing failed, using original", 0.45);
    processedBlob = file;
  }

  const { default: Tesseract } = await import("tesseract.js");

  report("Running OCR (English + Tamil)", 0.50);
  const result = await Tesseract.recognize(processedBlob, OCR_LANGUAGES, {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        report("Running OCR", 0.50 + m.progress * 0.30);
      }
    },
  });

  report("Extracting fields", 0.82);
  const text = result?.data?.text ?? "";
  const ocrConfidence = result?.data?.confidence ? result.data.confidence / 100 : 0.5;

  const withConfidence = parseBiodata(text, ocrConfidence, existing);
  const data = withConfidenceToProfile(withConfidence);

  report("Autofilling profile", 0.95);
  report("Done", 1);
  void sendNotification("ocr_completed").catch(() => {});
  return { text, data, withConfidence };
}

export function extractProfile(text: string): PartialProfile {
  const withConfidence = parseBiodata(text, 0.5);
  return withConfidenceToProfile(withConfidence);
}
