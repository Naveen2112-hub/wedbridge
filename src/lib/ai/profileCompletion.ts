/**
 * Smart Profile Completion Service
 * Auto-calculates age, completion %, missing fields, suggests corrections.
 * Highlights low-confidence fields from OCR.
 */
import type { ProfileWithConfidence, PartialProfile } from "@/lib/profile/ocrTypes";
import { confidenceLevel } from "@/lib/profile/ocrTypes";
import { calculateAge, calculateCompletion, getMissingFields } from "@/lib/ocr/fieldValidator";

export interface ProfileCompletionReport {
  completionPercentage: number;
  missingFields: string[];
  lowConfidenceFields: { field: string; value: string; confidence: number }[];
  suggestedCorrections: { field: string; currentValue: string; suggestedValue: string; reason: string }[];
  autoCalculated: { field: string; value: string }[];
  readyForReview: boolean;
}

const REQUIRED_FIELDS = [
  "name", "dateOfBirth", "gender", "religion", "caste", "phone",
  "education", "occupation", "district", "state",
];

const IMPORTANT_FIELDS = [
  ...REQUIRED_FIELDS,
  "height", "annualIncome", "motherTongue", "maritalStatus",
  "fatherName", "motherName", "nativePlace", "photoURL",
];

/**
 * Generate a comprehensive completion report for a profile.
 */
export function generateCompletionReport(
  data: PartialProfile,
  withConfidence?: ProfileWithConfidence,
): ProfileCompletionReport {
  const dataRecord = data as Record<string, string>;
  const completionPercentage = calculateCompletion(dataRecord);
  const missingFields = getMissingFields(dataRecord);
  const autoCalculated: { field: string; value: string }[] = [];

  // Auto-calculate age from DOB
  if (data.dateOfBirth && !data.age) {
    const age = calculateAge(data.dateOfBirth);
    if (age !== null && age >= 18 && age < 100) {
      autoCalculated.push({ field: "age", value: String(age) });
    }
  }

  // Identify low-confidence fields
  const lowConfidenceFields: { field: string; value: string; confidence: number }[] = [];
  if (withConfidence) {
    for (const [key, field] of Object.entries(withConfidence)) {
      if (field && field.confidence < 0.7) {
        lowConfidenceFields.push({
          field: key,
          value: field.value,
          confidence: field.confidence,
        });
      }
    }
  }

  // Suggest corrections
  const suggestedCorrections = generateCorrections(data);

  // Check if ready for review (all required fields present)
  const missingRequired = REQUIRED_FIELDS.filter((f) => !dataRecord[f] || !dataRecord[f].trim());
  const readyForReview = missingRequired.length === 0;

  return {
    completionPercentage,
    missingFields,
    lowConfidenceFields,
    suggestedCorrections,
    autoCalculated,
    readyForReview,
  };
}

function generateCorrections(data: PartialProfile): { field: string; currentValue: string; suggestedValue: string; reason: string }[] {
  const corrections: { field: string; currentValue: string; suggestedValue: string; reason: string }[] = [];
  const dataRecord = data as Record<string, string>;

  // Phone format correction
  if (dataRecord.phone) {
    const phone = dataRecord.phone.replace(/\s|-/g, "");
    if (phone.length === 10 && !phone.startsWith("+")) {
      corrections.push({
        field: "phone",
        currentValue: dataRecord.phone,
        suggestedValue: `+91${phone}`,
        reason: "Add country code for consistency",
      });
    }
  }

  // Email lowercase
  if (dataRecord.email && dataRecord.email !== dataRecord.email.toLowerCase().trim()) {
    corrections.push({
      field: "email",
      currentValue: dataRecord.email,
      suggestedValue: dataRecord.email.toLowerCase().trim(),
      reason: "Normalize email to lowercase",
    });
  }

  // Height format
  if (dataRecord.height) {
    const h = dataRecord.height;
    if (h.match(/^\d'\d{1,2}$/) && !h.includes('"')) {
      corrections.push({
        field: "height",
        currentValue: h,
        suggestedValue: `${h}"`,
        reason: 'Add inches symbol (")',
      });
    }
  }

  return corrections;
}

/**
 * Apply auto-calculated fields to a profile.
 */
export function applyAutoCalculations(data: PartialProfile): PartialProfile {
  const result = { ...data };

  if (result.dateOfBirth && !result.age) {
    const age = calculateAge(result.dateOfBirth);
    if (age !== null && age >= 18 && age < 100) {
      result.age = String(age);
    }
  }

  return result;
}

/**
 * Apply suggested corrections to a profile.
 */
export function applyCorrections(
  data: PartialProfile,
  corrections: { field: string; suggestedValue: string }[],
): PartialProfile {
  const result = { ...data };
  for (const c of corrections) {
    (result as Record<string, string>)[c.field] = c.suggestedValue;
  }
  return result;
}

/**
 * Get field label for display.
 */
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    name: "Name",
    dateOfBirth: "Date of Birth",
    age: "Age",
    height: "Height",
    weight: "Weight",
    religion: "Religion",
    caste: "Caste",
    subCaste: "Sub-Caste",
    education: "Education",
    occupation: "Occupation",
    company: "Company",
    annualIncome: "Annual Income",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    address: "Address",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    siblings: "Siblings",
    nativePlace: "Native Place",
    district: "District",
    state: "State",
    country: "Country",
  };
  return labels[field] ?? field;
}
