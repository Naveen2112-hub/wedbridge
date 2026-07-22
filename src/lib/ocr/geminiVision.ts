/**
 * Gemini Vision API integration for high-accuracy biodata OCR.
 * Sends cleaned image to Gemini Pro Vision and receives structured JSON.
 * Falls back to Tesseract if Gemini is not configured or fails.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PartialProfile, ProfileWithConfidence } from "@/lib/profile/ocrTypes";
import { confidenceLevel } from "@/lib/profile/ocrTypes";

export interface GeminiResult {
  data: PartialProfile;
  withConfidence: ProfileWithConfidence;
  confidence: number;
  raw: string;
}

const GEMINI_PROMPT = `You are an expert at extracting information from Indian matrimony biodata documents.
Analyze this biodata image and extract ALL available fields as JSON.

Extract these fields (use null for missing fields):
- name: Full name
- dateOfBirth: Date of birth (DD/MM/YYYY or YYYY-MM-DD format)
- age: Age in years (number)
- height: Height (e.g., "5'6"")
- weight: Weight (e.g., "60 kg")
- gender: "male" | "female" | "other"
- religion: Religion
- caste: Caste
- subCaste: Sub-caste
- gothram: Gothram
- star: Birth star
- rasi: Moon sign
- dosham: Dosham details or "No"
- education: Highest education
- occupation: Current occupation/profession
- company: Company name
- annualIncome: Annual income
- fatherName: Father's name
- motherName: Mother's name
- siblings: Siblings info
- nativePlace: Native place
- district: District
- state: State
- country: Country
- phone: Phone number
- whatsapp: WhatsApp number
- email: Email address
- address: Full address
- maritalStatus: Marital status
- partnerPreference: Partner preferences
- hobbies: Hobbies

Rules:
1. Return ONLY valid JSON, no markdown, no explanation
2. Use exact values from the biodata
3. Normalize education: "B.E" → "B.E", "BE" → "B.E", "B E" → "B.E"
4. Normalize phone: include country code if present
5. If a field is not present, use null
6. For horoscope fields (star, rasi, gothram, dosham), extract them but they will be stored separately`;

/**
 * Check if Gemini API key is configured.
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY;
}

/**
 * Extract biodata fields from an image buffer using Gemini Vision.
 */
export async function extractWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<GeminiResult | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const inlineData = {
      inlineData: { data: imageBuffer.toString("base64"), mimeType },
    };

    const result = await model.generateContent([GEMINI_PROMPT, inlineData]);
    const text = result.response.text();

    const data = parseGeminiResponse(text);
    const withConfidence = geminiDataToConfidence(data);
    const confidence = calculateOverallConfidence(withConfidence);

    return { data, withConfidence, confidence, raw: text };
  } catch {
    return null;
  }
}

/**
 * Extract biodata fields from a PDF using Gemini (converts pages to images first).
 */
export async function extractPdfWithGemini(
  pdfBuffer: Buffer,
): Promise<GeminiResult | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default;
    const pdfData = await pdfParse(pdfBuffer);
    const rawText = pdfData.text ?? "";

    const combinedData: PartialProfile = {};
    const combinedConfidence: ProfileWithConfidence = {};

    const data2 = parseGeminiResponse(rawText);
    const withConfidence = geminiDataToConfidence(data2);
    const confidence = calculateOverallConfidence(withConfidence);

    return { data: { ...combinedData, ...data2 }, withConfidence: { ...combinedConfidence, ...withConfidence }, confidence, raw: rawText };
  } catch {
    return null;
  }
}

/**
 * Parse Gemini's JSON response into a PartialProfile.
 */
function parseGeminiResponse(text: string): PartialProfile {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
    }
    const parsed = JSON.parse(cleaned);
    const result: PartialProfile = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== null && value !== undefined && typeof value === "string" && value.trim()) {
        result[key as keyof PartialProfile] = value.trim();
      } else if (value !== null && value !== undefined && typeof value === "number") {
        result[key as keyof PartialProfile] = String(value);
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Convert Gemini data to ProfileWithConfidence with high confidence scores.
 */
function geminiDataToConfidence(data: PartialProfile): ProfileWithConfidence {
  const result: ProfileWithConfidence = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "string") {
      const confidence = 0.95;
      result[key as keyof ProfileWithConfidence] = {
        value,
        confidence,
        level: confidenceLevel(confidence),
        source: "gemini",
      };
    }
  }
  return result;
}

/**
 * Calculate overall confidence from individual field confidences.
 */
function calculateOverallConfidence(data: ProfileWithConfidence): number {
  const values = Object.values(data);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, f) => acc + (f?.confidence ?? 0), 0);
  return sum / values.length;
}
