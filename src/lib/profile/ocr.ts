"use client";
import type { PartialProfile } from "./ocrTypes";

const FIELD_PATTERNS: { key: keyof PartialProfile; patterns: RegExp[]; extract?: (m: RegExpMatchArray) => string }[] = [
  { key: "name", patterns: [/name\s*[:\-]\s*([a-zA-Z .]{3,60})/i, /பெயர்\s*[:\-]?\s*([a-zA-Z .]{3,60})/i] },
  { key: "dateOfBirth", patterns: [/dob\s*[:\-]\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i, /date\s*of\s*birth\s*[:\-]\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i] },
  { key: "education", patterns: [/education\s*[:\-]\s*([a-zA-Z .,]{3,80})/i, /qualification\s*[:\-]\s*([a-zA-Z .,]{3,80})/i] },
  { key: "occupation", patterns: [/occupation\s*[:\-]\s*([a-zA-Z .,]{3,80})/i, /profession\s*[:\-]\s*([a-zA-Z .,]{3,80})/i, /job\s*[:\-]\s*([a-zA-Z .,]{3,80})/i] },
  { key: "religion", patterns: [/religion\s*[:\-]\s*([a-zA-Z ]{3,40})/i, /மதம்\s*[:\-]?\s*([a-zA-Z ]{3,40})/i] },
  { key: "caste", patterns: [/caste\s*[:\-]\s*([a-zA-Z ]{3,40})/i, /community\s*[:\-]\s*([a-zA-Z ]{3,40})/i] },
  { key: "height", patterns: [/height\s*[:\-]\s*(\d{1,2}'?\s?\d{1,2}"?|\d{3}\s?cm)/i] },
  { key: "district", patterns: [/district\s*[:\-]\s*([a-zA-Z ]{3,40})/i, /city\s*[:\-]\s*([a-zA-Z ]{3,40})/i] },
  { key: "phone", patterns: [/(\+?\d[\d\s\-]{8,14}\d)/] },
];

export async function runOCR(file: File): Promise<{ text: string; data: PartialProfile }> {
  const { default: Tesseract } = await import("tesseract.js");
  const result = await Tesseract.recognize(file, "eng", { logger: () => {} });
  const text = result?.data?.text ?? "";
  return { text, data: extractProfile(text) };
}

export function extractProfile(text: string): PartialProfile {
  const out: PartialProfile = {};
  for (const f of FIELD_PATTERNS) {
    for (const re of f.patterns) {
      const m = text.match(re);
      if (m) { (out as Record<string, unknown>)[f.key] = (f.extract ? f.extract(m) : m[1]).trim(); break; }
    }
  }
  return out;
}
