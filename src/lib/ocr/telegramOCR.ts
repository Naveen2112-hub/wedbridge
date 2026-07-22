/**
 * Server-side OCR pipeline for Telegram biodata import.
 * Uses Tesseract.js (Node.js compatible) and reuses the existing parser.
 */
import { parseBiodata, withConfidenceToProfile } from "@/lib/profile/ocrParser";
import type { ProfileWithConfidence, PartialProfile } from "@/lib/profile/ocrTypes";

export interface TelegramOCRResult {
  text: string;
  data: PartialProfile;
  withConfidence: ProfileWithConfidence;
  confidence: number;
}

/**
 * Run OCR on an image buffer (PNG/JPG) using Tesseract.js in Node.js.
 */
export async function runOCRImage(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<TelegramOCRResult> {
  const { default: Tesseract } = await import("tesseract.js");

  const langs = "eng+tam";
  const result = await Tesseract.recognize(imageBuffer, langs, {
    logger: () => {},
  });

  const text = result?.data?.text ?? "";
  const ocrConfidence = result?.data?.confidence ? result.data.confidence / 100 : 0.5;

  const withConfidence = parseBiodata(text, ocrConfidence);
  const data = withConfidenceToProfile(withConfidence);

  return { text, data, withConfidence, confidence: ocrConfidence };
}

/**
 * Run OCR on a PDF buffer. Extracts text from all pages using pdfjs-dist.
 */
export async function runOCRPdf(
  pdfBuffer: Buffer,
): Promise<TelegramOCRResult> {
  let combinedText = "";
  let ocrConfidence = 0.5;

  try {
    const pdfjs = await import("pdfjs-dist");
    const data = new Uint8Array(pdfBuffer);
    const doc = await pdfjs.getDocument({ data }).promise;
    const numPages = doc.numPages;
    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: unknown) => {
          const str = (item as { str?: string }).str;
          return typeof str === "string" ? str : "";
        })
        .join(" ");
      combinedText += pageText + "\n";
    }
    ocrConfidence = combinedText.trim().length > 50 ? 0.7 : 0.4;
  } catch {
    combinedText = "";
    ocrConfidence = 0.3;
  }

  const withConfidence = parseBiodata(combinedText, ocrConfidence);
  const data = withConfidenceToProfile(withConfidence);

  return { text: combinedText, data, withConfidence, confidence: ocrConfidence };
}

/**
 * Main entry point: detect file type and run appropriate OCR.
 */
export async function processBiodataFile(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<TelegramOCRResult> {
  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return runOCRPdf(fileBuffer);
  }
  return runOCRImage(fileBuffer, mimeType);
}

/**
 * Remove horoscope-related fields from extracted data.
 * The horoscope fields (gothram, star, rasi, dosham) are detected but
 * not included in the final import JSON per requirements.
 */
export function stripHoroscopeFields(data: PartialProfile): PartialProfile {
  const { gothram, star, rasi, dosham, ...rest } = data as Record<string, string>;
  void gothram; void star; void rasi; void dosham;
  return rest as PartialProfile;
}
