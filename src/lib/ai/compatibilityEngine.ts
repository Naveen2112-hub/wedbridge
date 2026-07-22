/**
 * AI Compatibility Engine
 * Generates rich compatibility breakdowns, strengths, weaknesses, and conversation starters.
 * Extends the existing weighted scoring in aiMatchService.ts.
 */
import type { ProfileDocument } from "@/firebase/schema";
import { calculateAge } from "@/lib/format";

export interface FactorScore {
  factor: string;
  label: string;
  score: number;
  maxScore: number;
  matched: boolean;
  detail: string;
}

export interface CompatibilityResult {
  overallScore: number;
  breakdown: FactorScore[];
  strengths: string[];
  weaknesses: string[];
  conversationStarters: string[];
}

interface FactorConfig {
  weight: number;
  label: string;
}

const FACTOR_CONFIG: Record<string, FactorConfig> = {
  religion: { weight: 20, label: "Religion" },
  caste: { weight: 15, label: "Caste" },
  age: { weight: 15, label: "Age Compatibility" },
  education: { weight: 10, label: "Education" },
  occupation: { weight: 10, label: "Occupation" },
  district: { weight: 10, label: "Location" },
  motherTongue: { weight: 10, label: "Mother Tongue" },
  lifestyle: { weight: 5, label: "Lifestyle" },
  food: { weight: 5, label: "Food Habit" },
  horoscope: { weight: 10, label: "Horoscope" },
  maritalStatus: { weight: 5, label: "Marital Status" },
  state: { weight: 5, label: "State" },
  country: { weight: 5, label: "Country" },
  income: { weight: 5, label: "Income" },
  height: { weight: 5, label: "Height" },
  smoking: { weight: 3, label: "Smoking" },
  drinking: { weight: 3, label: "Drinking" },
  star: { weight: 5, label: "Birth Star" },
  rasi: { weight: 5, label: "Moon Sign" },
  manglik: { weight: 5, label: "Manglik" },
  partnerPref: { weight: 10, label: "Partner Preferences" },
};

const TOTAL_WEIGHT = Object.values(FACTOR_CONFIG).reduce((a, b) => a + b.weight, 0);

function exactMatch(a: string | undefined | null, b: string | undefined | null): number {
  if (!a || !b) return 0;
  return a.toLowerCase() === b.toLowerCase() ? 1 : 0;
}

function ageDiffScore(a: number, b: number): number {
  const diff = Math.abs(a - b);
  if (diff <= 2) return 1;
  if (diff <= 5) return 0.8;
  if (diff <= 8) return 0.5;
  if (diff <= 12) return 0.3;
  return 0;
}

function heightDiffScore(a: string | undefined, b: string | undefined): number {
  if (!a || !b) return 0;
  const parseH = (h: string): number | null => {
    const m = h.match(/(\d)[''′]\s*(\d{1,2})/);
    if (m) return parseInt(m[1]) * 12 + parseInt(m[2]);
    const cm = h.match(/(\d{3})\s*cm/);
    if (cm) return Math.round(parseInt(cm[1]) / 2.54);
    return null;
  };
  const ha = parseH(a);
  const hb = parseH(b);
  if (ha === null || hb === null) return 0;
  const diff = Math.abs(ha - hb);
  if (diff <= 2) return 1;
  if (diff <= 4) return 0.8;
  if (diff <= 6) return 0.5;
  return 0.3;
}

function incomeRangeScore(a: string | undefined, b: string | undefined): number {
  if (!a || !b) return 0;
  const parseIncome = (s: string): number | null => {
    const m = s.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|lpa|cr|crore)/i);
    if (!m) return null;
    const num = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    if (unit.startsWith("cr")) return num * 100;
    return num;
  };
  const ia = parseIncome(a);
  const ib = parseIncome(b);
  if (ia === null || ib === null) return exactMatch(a, b);
  const diff = Math.abs(ia - ib);
  const maxVal = Math.max(ia, ib);
  const ratio = maxVal > 0 ? diff / maxVal : 1;
  if (ratio <= 0.1) return 1;
  if (ratio <= 0.3) return 0.8;
  if (ratio <= 0.5) return 0.5;
  return 0.3;
}

function partnerPrefScore(a: string | undefined, b: string | undefined): number {
  if (!a || !b) return 0;
  const wordsA = a.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const wordsB = b.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const overlap = wordsA.filter((w) => wordsB.includes(w)).length;
  return Math.min(overlap / 5, 1);
}

export function calculateCompatibility(user: ProfileDocument, candidate: ProfileDocument): CompatibilityResult {
  const breakdown: FactorScore[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const userAge = user.dateOfBirth ? calculateAge(user.dateOfBirth) : null;
  const candAge = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : null;

  // Religion
  const relScore = exactMatch(user.religion, candidate.religion);
  breakdown.push({ factor: "religion", label: FACTOR_CONFIG.religion.label, score: relScore, maxScore: FACTOR_CONFIG.religion.weight, matched: relScore > 0, detail: relScore > 0 ? `Both ${user.religion}` : "Different religions" });
  if (relScore > 0) strengths.push("Same religious background");

  // Caste
  const casteScore = exactMatch(user.caste, candidate.caste);
  breakdown.push({ factor: "caste", label: FACTOR_CONFIG.caste.label, score: casteScore, maxScore: FACTOR_CONFIG.caste.weight, matched: casteScore > 0, detail: casteScore > 0 ? `Both ${user.caste}` : "Different castes" });
  if (casteScore > 0) strengths.push("Same caste community");

  // Age
  if (userAge !== null && candAge !== null) {
    const aScore = ageDiffScore(userAge, candAge);
    breakdown.push({ factor: "age", label: FACTOR_CONFIG.age.label, score: aScore, maxScore: FACTOR_CONFIG.age.weight, matched: aScore >= 0.5, detail: `${candAge} yrs vs ${userAge} yrs (${Math.abs(candAge - userAge)} year gap)` });
    if (aScore >= 0.8) strengths.push("Ideal age difference");
    else if (aScore < 0.5) weaknesses.push("Age gap may be significant");
  }

  // Education
  const eduScore = exactMatch(user.education, candidate.education);
  breakdown.push({ factor: "education", label: FACTOR_CONFIG.education.label, score: eduScore, maxScore: FACTOR_CONFIG.education.weight, matched: eduScore > 0, detail: eduScore > 0 ? `Both ${user.education}` : "Different education fields" });
  if (eduScore > 0) strengths.push("Similar educational background");

  // Occupation
  const occScore = exactMatch(user.occupation, candidate.occupation);
  breakdown.push({ factor: "occupation", label: FACTOR_CONFIG.occupation.label, score: occScore, maxScore: FACTOR_CONFIG.occupation.weight, matched: occScore > 0, detail: occScore > 0 ? `Both in ${user.occupation}` : "Different professions" });

  // District
  const distScore = exactMatch(user.district, candidate.district);
  breakdown.push({ factor: "district", label: FACTOR_CONFIG.district.label, score: distScore, maxScore: FACTOR_CONFIG.district.weight, matched: distScore > 0, detail: distScore > 0 ? `Both in ${user.district}` : "Different districts" });
  if (distScore > 0) strengths.push("Same city/district");

  // Mother tongue
  const mtScore = exactMatch(user.motherTongue, candidate.motherTongue);
  breakdown.push({ factor: "motherTongue", label: FACTOR_CONFIG.motherTongue.label, score: mtScore, maxScore: FACTOR_CONFIG.motherTongue.weight, matched: mtScore > 0, detail: mtScore > 0 ? `Both speak ${user.motherTongue}` : "Different mother tongues" });
  if (mtScore > 0) strengths.push("Same mother tongue");

  // Lifestyle
  const lifeScore = exactMatch(user.lifestyle, candidate.lifestyle);
  breakdown.push({ factor: "lifestyle", label: FACTOR_CONFIG.lifestyle.label, score: lifeScore, maxScore: FACTOR_CONFIG.lifestyle.weight, matched: lifeScore > 0, detail: lifeScore > 0 ? "Similar lifestyle" : "Lifestyle differences" });

  // Food
  const foodScore = exactMatch(user.foodPreference, candidate.foodPreference);
  breakdown.push({ factor: "food", label: FACTOR_CONFIG.food.label, score: foodScore, maxScore: FACTOR_CONFIG.food.weight, matched: foodScore > 0, detail: foodScore > 0 ? `Both ${user.foodPreference}` : "Different food habits" });

  // Marital status
  const msScore = exactMatch(user.maritalStatus, candidate.maritalStatus);
  breakdown.push({ factor: "maritalStatus", label: FACTOR_CONFIG.maritalStatus.label, score: msScore, maxScore: FACTOR_CONFIG.maritalStatus.weight, matched: msScore > 0, detail: msScore > 0 ? "Same marital status" : "Different marital status" });

  // State
  const stateScore = exactMatch(user.state, candidate.state);
  breakdown.push({ factor: "state", label: FACTOR_CONFIG.state.label, score: stateScore, maxScore: FACTOR_CONFIG.state.weight, matched: stateScore > 0, detail: stateScore > 0 ? `Both in ${user.state}` : "Different states" });

  // Country
  const countryScore = exactMatch(user.country, candidate.country);
  breakdown.push({ factor: "country", label: FACTOR_CONFIG.country.label, score: countryScore, maxScore: FACTOR_CONFIG.country.weight, matched: countryScore > 0, detail: countryScore > 0 ? `Both in ${user.country}` : "Different countries" });

  // Income
  const incomeScore = incomeRangeScore(user.annualIncome, candidate.annualIncome);
  breakdown.push({ factor: "income", label: FACTOR_CONFIG.income.label, score: incomeScore, maxScore: FACTOR_CONFIG.income.weight, matched: incomeScore >= 0.5, detail: incomeScore >= 0.8 ? "Similar income range" : "Income difference" });

  // Height
  const hScore = heightDiffScore(user.height, candidate.height);
  breakdown.push({ factor: "height", label: FACTOR_CONFIG.height.label, score: hScore, maxScore: FACTOR_CONFIG.height.weight, matched: hScore >= 0.5, detail: hScore >= 0.8 ? "Similar height" : "Height difference" });

  // Smoking
  const smokeScore = exactMatch(user.smoking, candidate.smoking);
  breakdown.push({ factor: "smoking", label: FACTOR_CONFIG.smoking.label, score: smokeScore, maxScore: FACTOR_CONFIG.smoking.weight, matched: smokeScore > 0, detail: smokeScore > 0 ? "Same smoking preference" : "Different smoking habits" });

  // Drinking
  const drinkScore = exactMatch(user.drinking, candidate.drinking);
  breakdown.push({ factor: "drinking", label: FACTOR_CONFIG.drinking.label, score: drinkScore, maxScore: FACTOR_CONFIG.drinking.weight, matched: drinkScore > 0, detail: drinkScore > 0 ? "Same drinking preference" : "Different drinking habits" });

  // Star
  const starScore = exactMatch(user.star, candidate.star);
  breakdown.push({ factor: "star", label: FACTOR_CONFIG.star.label, score: starScore, maxScore: FACTOR_CONFIG.star.weight, matched: starScore > 0, detail: starScore > 0 ? `Both ${user.star} star` : "Different birth stars" });
  if (starScore > 0) strengths.push("Matching birth star");

  // Rasi
  const rasiScore = exactMatch(user.rasi, candidate.rasi);
  breakdown.push({ factor: "rasi", label: FACTOR_CONFIG.rasi.label, score: rasiScore, maxScore: FACTOR_CONFIG.rasi.weight, matched: rasiScore > 0, detail: rasiScore > 0 ? `Both ${user.rasi} rasi` : "Different moon signs" });

  // Manglik
  const manglikScore = exactMatch(user.manglik, candidate.manglik);
  breakdown.push({ factor: "manglik", label: FACTOR_CONFIG.manglik.label, score: manglikScore, maxScore: FACTOR_CONFIG.manglik.weight, matched: manglikScore > 0, detail: manglikScore > 0 ? "Same manglik status" : "Different manglik status" });

  // Horoscope
  const horoMatch = (user.horoscope === "yes" && candidate.horoscope === "yes") ? 1 : 0;
  breakdown.push({ factor: "horoscope", label: FACTOR_CONFIG.horoscope.label, score: horoMatch, maxScore: FACTOR_CONFIG.horoscope.weight, matched: horoMatch > 0, detail: horoMatch > 0 ? "Horoscope compatible" : "Horoscope not matched" });

  // Partner preferences
  const ppScore = partnerPrefScore(user.partnerPreference, candidate.partnerPreference);
  breakdown.push({ factor: "partnerPref", label: FACTOR_CONFIG.partnerPref.label, score: ppScore, maxScore: FACTOR_CONFIG.partnerPref.weight, matched: ppScore > 0.4, detail: ppScore > 0.4 ? "Preferences align" : "Preferences may differ" });
  if (ppScore > 0.4) strengths.push("Partner preferences align");

  // Calculate weighted total
  let weightedSum = 0;
  for (const f of breakdown) {
    weightedSum += f.score * f.maxScore;
  }
  const overallScore = Math.round((weightedSum / TOTAL_WEIGHT) * 100);

  // Identify weaknesses (factors with score < 0.3 and weight >= 5)
  for (const f of breakdown) {
    if (f.score < 0.3 && f.maxScore >= 5 && f.detail !== "Different religions" && f.detail !== "Different castes") {
      weaknesses.push(f.detail);
    }
  }

  // Generate conversation starters
  const starters = generateConversationStarters(user, candidate, breakdown);

  return {
    overallScore,
    breakdown,
    strengths: strengths.slice(0, 8),
    weaknesses: weaknesses.slice(0, 5),
    conversationStarters: starters,
  };
}

function generateConversationStarters(
  user: ProfileDocument,
  candidate: ProfileDocument,
  breakdown: FactorScore[],
): string[] {
  const starters: string[] = [];

  if (candidate.education) {
    starters.push(`I see you studied ${candidate.education}! What drew you to that field?`);
  }
  if (candidate.occupation) {
    starters.push(`As a ${candidate.occupation}, what do you enjoy most about your work?`);
  }
  if (candidate.district && breakdown.find((f) => f.factor === "district" && f.matched)) {
    starters.push(`Great to find someone from ${candidate.district}! How long have you lived there?`);
  }
  if (candidate.motherTongue && breakdown.find((f) => f.factor === "motherTongue" && f.matched)) {
    starters.push(`We share the same mother tongue (${candidate.motherTongue}). Do you speak it at home?`);
  }
  if (candidate.hobbies) {
    starters.push(`I noticed your hobbies include ${candidate.hobbies}. Tell me more!`);
  }
  if (candidate.foodPreference) {
    starters.push(`Are you ${candidate.foodPreference}? What's your favourite cuisine?`);
  }
  if (candidate.star) {
    starters.push(`Your birth star is ${candidate.star}. Do you follow astrology?`);
  }
  if (candidate.nativePlace) {
    starters.push(`Your native place is ${candidate.nativePlace}. Have you visited recently?`);
  }
  if (candidate.bio) {
    starters.push("I enjoyed reading your bio. What are you most looking forward to in a partner?");
  }

  // Generic fallback
  if (starters.length < 3) {
    starters.push("Hi! I liked your profile and would love to get to know you better.");
    starters.push("Hello! We seem to have a lot in common. How has your week been?");
  }

  return starters.slice(0, 5);
}
