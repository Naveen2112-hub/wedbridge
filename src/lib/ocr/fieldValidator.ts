/**
 * AI field validation and correction.
 * Fixes common OCR mistakes and normalizes field values.
 */
import type { PartialProfile, ProfileWithConfidence } from "@/lib/profile/ocrTypes";

const EDUCATION_NORMALIZATIONS: Record<string, string> = {
  "b e": "B.E", "be": "B.E", "b.e": "B.E", "b.e.": "B.E",
  "b tech": "B.Tech", "btech": "B.Tech", "b.tech": "B.Tech", "b.tech.": "B.Tech",
  "m e": "M.E", "me": "M.E", "m.e": "M.E", "m.e.": "M.E",
  "m tech": "M.Tech", "mtech": "M.Tech", "m.tech": "M.Tech",
  "b sc": "B.Sc", "bsc": "B.Sc", "b.sc": "B.Sc", "b.sc.": "B.Sc",
  "m sc": "M.Sc", "msc": "M.Sc", "m.sc": "M.Sc",
  "b a": "B.A", "ba": "B.A", "b.a": "B.A",
  "m a": "M.A", "ma": "M.A", "m.a": "M.A",
  "b com": "B.Com", "bcom": "B.Com", "b.com": "B.Com",
  "m com": "M.Com", "mcom": "M.Com", "m.com": "M.Com",
  "bba": "BBA", "b b a": "BBA",
  "mba": "MBA", "m b a": "MBA",
  "bca": "BCA", "mca": "MCA",
  "b ed": "B.Ed", "bed": "B.Ed", "b.ed": "B.Ed",
  "m ed": "M.Ed", "med": "M.Ed", "m.ed": "M.Ed",
  "phd": "Ph.D", "p h d": "Ph.D", "ph.d": "Ph.D",
  "bachelor of engineering": "B.E",
  "master of engineering": "M.E",
  "bachelor of technology": "B.Tech",
  "master of technology": "M.Tech",
  "bachelor of science": "B.Sc",
  "master of science": "M.Sc",
  "bachelor of arts": "B.A",
  "master of arts": "M.A",
  "bachelor of commerce": "B.Com",
  "master of commerce": "M.Com",
  "bachelor of education": "B.Ed",
  "bachelor of computer applications": "BCA",
  "master of computer applications": "MCA",
  "bachelor of business administration": "BBA",
  "master of business administration": "MBA",
  "diploma": "Diploma",
  "iti": "ITI",
  "10th": "SSLC", "10": "SSLC", "sslc": "SSLC",
  "12th": "HSC", "12": "HSC", "hsc": "HSC", "+2": "HSC",
};

const OCCUPATION_NORMALIZATIONS: Record<string, string> = {
  "software engg": "Software Engineer",
  "software engineer": "Software Engineer",
  "software developer": "Software Developer",
  "sr software engineer": "Senior Software Engineer",
  "senior software engineer": "Senior Software Engineer",
  "tech lead": "Technical Lead",
  "team lead": "Team Lead",
  "project manager": "Project Manager",
  "product manager": "Product Manager",
  "business analyst": "Business Analyst",
  "data analyst": "Data Analyst",
  "data scientist": "Data Scientist",
  "full stack developer": "Full Stack Developer",
  "frontend developer": "Frontend Developer",
  "backend developer": "Backend Developer",
  "devops engineer": "DevOps Engineer",
  "cloud engineer": "Cloud Engineer",
  "site reliability engineer": "Site Reliability Engineer",
  "quality engineer": "Quality Engineer",
  "test engineer": "Test Engineer",
  "qa engineer": "QA Engineer",
  "civil engineer": "Civil Engineer",
  "mechanical engineer": "Mechanical Engineer",
  "electrical engineer": "Electrical Engineer",
  "accountant": "Accountant",
  "teacher": "Teacher",
  "professor": "Professor",
  "lecturer": "Lecturer",
  "doctor": "Doctor",
  "nurse": "Nurse",
  "pharmacist": "Pharmacist",
  "lawyer": "Lawyer",
  "advocate": "Advocate",
  "bank manager": "Bank Manager",
  "banking": "Banking Professional",
  "government employee": "Government Employee",
  "govt employee": "Government Employee",
  "businessman": "Businessman",
  "business man": "Businessman",
  "business": "Business",
  "entrepreneur": "Entrepreneur",
  "self employed": "Self Employed",
  "private employee": "Private Employee",
  "private employee.": "Private Employee",
};

const INCOME_NORMALIZATIONS: Record<string, string> = {
  "lpa": "LPA", "l p a": "LPA", "lakhs": "Lakhs", "lakh": "Lakh",
  "per annum": "per annum", "p a": "per annum", "p.a": "per annum",
};

/**
 * Validate and correct all extracted fields.
 */
export function validateAndCorrect(
  data: PartialProfile,
  withConfidence: ProfileWithConfidence,
): { data: PartialProfile; withConfidence: ProfileWithConfidence; corrections: string[] } {
  const corrected: PartialProfile = { ...data };
  const correctedConf: ProfileWithConfidence = { ...withConfidence };
  const corrections: string[] = [];

  if (corrected.education) {
    const normalized = normalizeEducation(corrected.education);
    if (normalized !== corrected.education) {
      corrections.push(`Education: "${corrected.education}" → "${normalized}"`);
      corrected.education = normalized;
      if (correctedConf.education) correctedConf.education.value = normalized;
    }
  }

  if (corrected.occupation) {
    const normalized = normalizeOccupation(corrected.occupation);
    if (normalized !== corrected.occupation) {
      corrections.push(`Occupation: "${corrected.occupation}" → "${normalized}"`);
      corrected.occupation = normalized;
      if (correctedConf.occupation) correctedConf.occupation.value = normalized;
    }
  }

  if (corrected.phone) {
    const normalized = normalizePhone(corrected.phone);
    if (normalized !== corrected.phone) {
      corrections.push(`Phone: "${corrected.phone}" → "${normalized}"`);
      corrected.phone = normalized;
      if (correctedConf.phone) correctedConf.phone.value = normalized;
    }
  }

  if (corrected.whatsapp) {
    const normalized = normalizePhone(corrected.whatsapp);
    if (normalized !== corrected.whatsapp) {
      corrected.whatsapp = normalized;
      if (correctedConf.whatsapp) correctedConf.whatsapp.value = normalized;
    }
  }

  if (corrected.email) {
    const normalized = corrected.email.toLowerCase().trim();
    if (normalized !== corrected.email) {
      corrected.email = normalized;
      if (correctedConf.email) correctedConf.email.value = normalized;
    }
  }

  if (corrected.annualIncome) {
    const normalized = normalizeIncome(corrected.annualIncome);
    if (normalized !== corrected.annualIncome) {
      corrections.push(`Income: "${corrected.annualIncome}" → "${normalized}"`);
      corrected.annualIncome = normalized;
      if (correctedConf.annualIncome) correctedConf.annualIncome.value = normalized;
    }
  }

  if (corrected.height) {
    const normalized = normalizeHeight(corrected.height);
    if (normalized !== corrected.height) {
      corrections.push(`Height: "${corrected.height}" → "${normalized}"`);
      corrected.height = normalized;
      if (correctedConf.height) correctedConf.height.value = normalized;
    }
  }

  if (corrected.dateOfBirth) {
    const normalized = normalizeDate(corrected.dateOfBirth);
    if (normalized !== corrected.dateOfBirth) {
      corrections.push(`DOB: "${corrected.dateOfBirth}" → "${normalized}"`);
      corrected.dateOfBirth = normalized;
      if (correctedConf.dateOfBirth) correctedConf.dateOfBirth.value = normalized;
    }
  }

  return { data: corrected, withConfidence: correctedConf, corrections };
}

function normalizeEducation(value: string): string {
  const lower = value.toLowerCase().trim();
  if (EDUCATION_NORMALIZATIONS[lower]) return EDUCATION_NORMALIZATIONS[lower];
  for (const [key, val] of Object.entries(EDUCATION_NORMALIZATIONS)) {
    if (lower.includes(key)) return val;
  }
  return value.trim();
}

function normalizeOccupation(value: string): string {
  const lower = value.toLowerCase().trim();
  if (OCCUPATION_NORMALIZATIONS[lower]) return OCCUPATION_NORMALIZATIONS[lower];
  for (const [key, val] of Object.entries(OCCUPATION_NORMALIZATIONS)) {
    if (lower.includes(key)) return val;
  }
  return value.trim().replace(/\s+/g, " ");
}

function normalizePhone(value: string): string {
  let cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+91")) return cleaned;
  if (cleaned.length === 10 && cleaned.startsWith("9")) return "+91" + cleaned;
  if (cleaned.length === 10) return "+91" + cleaned;
  if (cleaned.length === 11 && cleaned.startsWith("0")) return "+91" + cleaned.slice(1);
  if (cleaned.length === 12 && cleaned.startsWith("91")) return "+" + cleaned;
  return cleaned;
}

function normalizeIncome(value: string): string {
  let result = value.trim();
  const lower = result.toLowerCase();
  for (const [key, val] of Object.entries(INCOME_NORMALIZATIONS)) {
    result = result.replace(new RegExp(key, "gi"), val);
  }
  if (!result.match(/₹|\$|rs|inr|lpa|lakh/i) && result.match(/^\d/)) {
    result = "₹" + result;
  }
  return result.replace(/\s+/g, " ");
}

function normalizeHeight(value: string): string {
  const match = value.match(/(\d)\s*[''′]\s*(\d{1,2})\s*["″]?/);
  if (match) return `${match[1]}'${match[2]}"`;
  const cmMatch = value.match(/(\d{3})\s*cm/i);
  if (cmMatch) {
    const totalInches = Math.round(parseInt(cmMatch[1]) / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  }
  return value.trim();
}

function normalizeDate(value: string): string {
  const ddmmyyyy = value.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  const yyyymmdd = value.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, y, m, d] = yyyymmdd;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return value.trim();
}

/**
 * Calculate age from date of birth.
 */
export function calculateAge(dob: string): number | null {
  const match = dob.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!match) return null;
  let [, d, m, y] = match;
  const day = parseInt(d);
  const month = parseInt(m);
  let year = parseInt(y);
  if (year < 100) year += 2000;
  const birthDate = new Date(year, month - 1, day);
  if (isNaN(birthDate.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) age--;
  return age >= 0 && age < 120 ? age : null;
}

/**
 * Calculate profile completion percentage.
 */
export function calculateCompletion(data: Record<string, string>): number {
  const importantFields = [
    "name", "dateOfBirth", "age", "height", "religion", "caste",
    "education", "occupation", "phone", "email", "address",
    "fatherName", "motherName", "siblings", "nativePlace",
    "subCaste", "annualIncome", "company",
  ];
  let filled = 0;
  for (const field of importantFields) {
    if (data[field] && data[field].trim()) filled++;
  }
  return (filled / importantFields.length) * 100;
}

/**
 * Get list of missing fields.
 */
export function getMissingFields(data: Record<string, string>): string[] {
  const allFields = [
    "name", "dateOfBirth", "age", "height", "weight", "religion", "caste",
    "subCaste", "education", "occupation", "company", "annualIncome",
    "phone", "whatsapp", "email", "address",
    "fatherName", "motherName", "siblings", "nativePlace",
  ];
  return allFields.filter((f) => !data[f] || !data[f].trim());
}
