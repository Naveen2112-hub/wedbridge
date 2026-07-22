/**
 * Server-side OCR pipeline for Telegram biodata import.
 * Pipeline: file detection → Gemini Vision (primary) → Tesseract (fallback) → field validation.
 */
import { parseBiodata, withConfidenceToProfile } from "@/lib/profile/ocrParser";
import type { ProfileWithConfidence, PartialProfile } from "@/lib/profile/ocrTypes";
import { confidenceLevel } from "@/lib/profile/ocrTypes";
import { extractWithGemini, isGeminiConfigured } from "@/lib/ocr/geminiVision";
import { validateAndCorrect, calculateAge } from "@/lib/ocr/fieldValidator";
import { analyzeFile, isValidMime, isSafeFile, type FileAnalysis } from "@/lib/ocr/fileTypeDetection";
import { analyzeLayout, cropToBiodataRegion, preprocessForOCR } from "@/lib/ocr/layoutDetection";

export interface TelegramOCRResult {
  text: string;
  data: PartialProfile;
  withConfidence: ProfileWithConfidence;
  confidence: number;
  fileAnalysis: FileAnalysis;
  corrections: string[];
  source: "gemini" | "tesseract" | "pdf_text";
  processingTimeMs: number;
}

/**
 * Main entry point: detect file type, try Gemini Vision first, fallback to Tesseract.
 */
export async function processBiodataFile(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<TelegramOCRResult> {
  const startTime = Date.now();

  // Security: validate MIME and file safety
  if (!isValidMime(mimeType, fileName)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
  if (!isSafeFile(fileBuffer, mimeType)) {
    throw new Error("File failed security validation");
  }

  // Step 1: File type detection
  const fileAnalysis = analyzeFile(fileBuffer, mimeType, fileName);

  let result: {
    text: string;
    data: PartialProfile;
    withConfidence: ProfileWithConfidence;
    confidence: number;
    source: "gemini" | "tesseract" | "pdf_text";
    corrections: string[];
  };

  // Step 6: Try Gemini Vision first (for images and scanned PDFs)
  if (fileAnalysis.type !== "pdf" || fileAnalysis.isScanned) {
    if (isGeminiConfigured()) {
      const geminiResult = await extractWithGemini(fileBuffer, fileAnalysis.mimeType);
      if (geminiResult && Object.keys(geminiResult.data).length >= 3) {
        const { data, withConfidence, corrections } = validateAndCorrect(
          geminiResult.data,
          geminiResult.withConfidence,
        );
        const age = data.dateOfBirth ? calculateAge(data.dateOfBirth) : null;
        if (age !== null && !data.age) {
          data.age = String(age);
          withConfidence.age = {
            value: String(age),
            confidence: 0.98,
            level: confidenceLevel(0.98),
            source: "calculated",
          };
        }
        return {
          text: geminiResult.raw,
          data,
          withConfidence,
          confidence: geminiResult.confidence,
          fileAnalysis,
          corrections,
          source: "gemini",
          processingTimeMs: Date.now() - startTime,
        };
      }
    }
  }

  // Fallback: Tesseract for images, pdfjs for digital PDFs
  if (fileAnalysis.type === "pdf" && !fileAnalysis.isScanned) {
    result = await runOCRPdf(fileBuffer);
  } else {
    // Layout detection: crop to biodata region, remove decorations
    let imageBuffer = fileBuffer;
    try {
      const layout = await analyzeLayout(fileBuffer, fileAnalysis.mimeType);
      if (layout.biodataRegion) {
        imageBuffer = await cropToBiodataRegion(fileBuffer, layout.biodataRegion);
      }
      imageBuffer = await preprocessForOCR(imageBuffer);
    } catch {
      // If layout detection fails, use original image
    }
    result = await runOCRImage(imageBuffer, fileAnalysis.mimeType);
  }

  const { data, withConfidence, corrections } = validateAndCorrect(
    result.data,
    result.withConfidence,
  );

  // Auto-calculate age from DOB
  const age = data.dateOfBirth ? calculateAge(data.dateOfBirth) : null;
  if (age !== null && !data.age) {
    data.age = String(age);
    withConfidence.age = {
      value: String(age),
      confidence: 0.98,
      level: confidenceLevel(0.98),
      source: "calculated",
    };
  }

  return {
    ...result,
    data,
    withConfidence,
    corrections,
    fileAnalysis,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Run OCR on an image buffer using Tesseract.js.
 */
export async function runOCRImage(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<{
  text: string;
  data: PartialProfile;
  withConfidence: ProfileWithConfidence;
  confidence: number;
  source: "gemini" | "tesseract" | "pdf_text";
  corrections: string[];
}> {
  const { default: Tesseract } = await import("tesseract.js");

  const result = await Tesseract.recognize(imageBuffer, "eng+tam", {
    logger: () => {},
  });

  const text = result?.data?.text ?? "";
  const ocrConfidence = result?.data?.confidence ? result.data.confidence / 100 : 0.5;

  const withConfidence = parseBiodata(text, ocrConfidence);
  const data = withConfidenceToProfile(withConfidence);

  return { text, data, withConfidence, confidence: ocrConfidence, source: "tesseract", corrections: [] };
}

/**
 * Run OCR on a PDF buffer using pdf-parse text extraction.
 */
export async function runOCRPdf(
  pdfBuffer: Buffer,
): Promise<{
  text: string;
  data: PartialProfile;
  withConfidence: ProfileWithConfidence;
  confidence: number;
  source: "gemini" | "tesseract" | "pdf_text";
  corrections: string[];
}> {
  let combinedText = "";
  let ocrConfidence = 0.5;

  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default;
    const pdfData = await pdfParse(pdfBuffer);
    combinedText = pdfData.text ?? "";
    ocrConfidence = combinedText.trim().length > 50 ? 0.7 : 0.4;
  } catch {
    combinedText = "";
    ocrConfidence = 0.3;
  }

  const withConfidence = parseBiodata(combinedText, ocrConfidence);
  const data = withConfidenceToProfile(withConfidence);

  return { text: combinedText, data, withConfidence, confidence: ocrConfidence, source: "pdf_text", corrections: [] };
}

/**
 * Remove horoscope-related fields from extracted data.
 */
export function stripHoroscopeFields(data: PartialProfile): PartialProfile {
  const { gothram, star, rasi, dosham, ...rest } = data as Record<string, string>;
  void gothram; void star; void rasi; void dosham;
  return rest as PartialProfile;
}
