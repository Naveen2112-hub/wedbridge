export type OCRConfidence = "high" | "medium" | "low";

export interface ExtractedField {
  value: string;
  confidence: number;
  level: OCRConfidence;
  source: string;
}

export type FieldKey =
  | "name" | "dateOfBirth" | "age" | "height" | "weight"
  | "education" | "occupation" | "company" | "annualIncome"
  | "fatherName" | "motherName" | "siblings"
  | "religion" | "caste" | "subCaste" | "gothram" | "star" | "rasi" | "dosham"
  | "nativePlace" | "district" | "state" | "country"
  | "phone" | "whatsapp" | "email" | "address"
  | "expectations" | "hobbies" | "partnerPreference";

export type PartialProfile = Partial<Record<FieldKey, string>>;

export type ProfileWithConfidence = Partial<Record<FieldKey, ExtractedField>>;

export const HIGH_THRESHOLD = 0.75;
export const MEDIUM_THRESHOLD = 0.5;

export function confidenceLevel(score: number): OCRConfidence {
  if (score >= HIGH_THRESHOLD) return "high";
  if (score >= MEDIUM_THRESHOLD) return "medium";
  return "low";
}

export function autofillFields(data: ProfileWithConfidence): PartialProfile {
  const out: PartialProfile = {};
  for (const [key, field] of Object.entries(data)) {
    if (field && field.level === "high" && field.value) {
      out[key as FieldKey] = field.value;
    }
  }
  return out;
}

export function reviewFields(data: ProfileWithConfidence): { key: FieldKey; field: ExtractedField }[] {
  return (Object.entries(data) as [FieldKey, ExtractedField][])
    .filter(([, field]) => field.level !== "high")
    .map(([key, field]) => ({ key, field }));
}

export function missingFields(data: ProfileWithConfidence): FieldKey[] {
  const all: FieldKey[] = [
    "name", "dateOfBirth", "age", "height", "weight", "education", "occupation",
    "annualIncome", "fatherName", "motherName", "siblings", "religion", "caste",
    "subCaste", "gothram", "star", "rasi", "dosham", "nativePlace", "district",
    "state", "country", "phone", "email", "address", "expectations", "hobbies",
    "partnerPreference",
  ];
  return all.filter((k) => !data[k] || !data[k]!.value);
}
