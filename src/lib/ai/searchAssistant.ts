/**
 * AI Search Assistant
 * Converts natural language queries (English, Tamil, mixed) into SearchFilters.
 * Uses pattern matching + keyword extraction - no external API needed.
 */
import type { SearchFilters } from "@/lib/search/searchService";

export interface ParsedQuery {
  filters: SearchFilters;
  explanation: string;
  confidence: number;
}

const OCCUPATION_KEYWORDS: Record<string, string> = {
  "software engineer": "Software Engineer",
  "software developer": "Software Developer",
  "teacher": "Teacher",
  "professor": "Professor",
  "doctor": "Doctor",
  "nurse": "Nurse",
  "engineer": "Engineer",
  "accountant": "Accountant",
  "lawyer": "Lawyer",
  "advocate": "Advocate",
  "businessman": "Businessman",
  "business": "Business",
  "banker": "Banker",
  "manager": "Manager",
  "developer": "Developer",
  "designer": "Designer",
  "architect": "Architect",
  "pharmacist": "Pharmacist",
  "lecturer": "Lecturer",
  "government employee": "Government Employee",
  "govt employee": "Government Employee",
  "it professional": "IT Professional",
  "civil engineer": "Civil Engineer",
  "mechanical engineer": "Mechanical Engineer",
  "electrical engineer": "Electrical Engineer",
  "ஆசிரியர்": "Teacher",
  "மருத்துவர்": "Doctor",
  "பொறியாளர்": "Engineer",
  "வழக்கறிஞர்": "Lawyer",
  "விவசாயி": "Farmer",
  "அரசு ஊழியர்": "Government Employee",
};

const DISTRICT_KEYWORDS: Record<string, string> = {
  "chennai": "Chennai",
  "coimbatore": "Coimbatore",
  "madurai": "Madurai",
  "salem": "Salem",
  "trichy": "Tiruchirappalli",
  "tiruchirappalli": "Tiruchirappalli",
  "tirunelveli": "Tirunelveli",
  "vellore": "Vellore",
  "erode": "Erode",
  "thoothukudi": "Thoothukudi",
  "dindigul": "Dindigul",
  "thanjavur": "Thanjavur",
  "kanyakumari": "Kanyakumari",
  "சென்னை": "Chennai",
  "கோயம்புத்தூர்": "Coimbatore",
  "மதுரை": "Madurai",
  "சேலம்": "Salem",
  "திருச்சி": "Tiruchirappalli",
  "திருநெல்வேலி": "Tirunelveli",
  "வேலூர்": "Vellore",
  "ஈரோடு": "Erode",
};

const RELIGION_KEYWORDS: Record<string, string> = {
  "hindu": "Hindu",
  "christian": "Christian",
  "muslim": "Muslim",
  "jain": "Jain",
  "sikh": "Sikh",
  "இந்து": "Hindu",
  "கிறிஸ்தவர்": "Christian",
  "முஸ்லிம்": "Muslim",
};

const EDUCATION_KEYWORDS: Record<string, string> = {
  "b.e": "B.E",
  "be": "B.E",
  "b.tech": "B.Tech",
  "btech": "B.Tech",
  "m.e": "M.E",
  "m.tech": "M.Tech",
  "b.sc": "B.Sc",
  "m.sc": "M.Sc",
  "b.com": "B.Com",
  "m.com": "M.Com",
  "b.a": "B.A",
  "m.a": "M.A",
  "mba": "MBA",
  "bba": "BBA",
  "bca": "BCA",
  "mca": "MCA",
  "phd": "Ph.D",
  "b.ed": "B.Ed",
  "bachelor": "B.E",
  "master": "M.E",
  "diploma": "Diploma",
  "iti": "ITI",
  "பட்டயம்": "Diploma",
  "இளநிலை": "B.E",
  " " : "",
};

const FOOD_KEYWORDS: Record<string, string> = {
  "vegetarian": "vegetarian",
  "veg": "vegetarian",
  "non-vegetarian": "non-vegetarian",
  "non veg": "non-vegetarian",
  "nonveg": "non-vegetarian",
  "eggetarian": "eggetarian",
  "சைவம்": "vegetarian",
  "அசைவம்": "non-vegetarian",
};

const MARITAL_KEYWORDS: Record<string, string> = {
  "never married": "never_married",
  "unmarried": "never_married",
  "divorced": "divorced",
  "widowed": "widowed",
  "awaiting divorce": "awaiting_divorce",
  "விவாகரத்து": "divorced",
};

const GENDER_KEYWORDS: Record<string, string> = {
  "bride": "female",
  "brides": "female",
  "groom": "male",
  "grooms": "male",
  "girl": "female",
  "girls": "female",
  "boy": "male",
  "boys": "male",
  "female": "female",
  "male": "male",
  "மணமகள்": "female",
  "மணமகன்": "male",
  "பெண்": "female",
  "ஆண்": "male",
};

/**
 * Parse a natural language search query into structured SearchFilters.
 */
export function parseSearchQuery(query: string): ParsedQuery {
  const text = query.toLowerCase().trim();
  const filters: SearchFilters = {};
  const explanations: string[] = [];
  let confidence = 0.5;

  // Gender detection
  for (const [keyword, value] of Object.entries(GENDER_KEYWORDS)) {
    if (text.includes(keyword)) {
      filters.gender = value;
      explanations.push(`Gender: ${value}`);
      confidence += 0.1;
      break;
    }
  }

  // Age detection: "under 27", "below 30", "above 25", "25 to 30"
  const ageRangeMatch = text.match(/(\d+)\s*(?:to|-\s*)\s*(\d+)\s*(?:years|yrs|age)?/);
  if (ageRangeMatch) {
    filters.minAge = parseInt(ageRangeMatch[1]);
    filters.maxAge = parseInt(ageRangeMatch[2]);
    explanations.push(`Age: ${filters.minAge}-${filters.maxAge}`);
    confidence += 0.15;
  } else {
    const underMatch = text.match(/(?:under|below|less than)\s*(\d+)/);
    if (underMatch) {
      filters.maxAge = parseInt(underMatch[1]);
      explanations.push(`Age: under ${filters.maxAge}`);
      confidence += 0.1;
    }
    const overMatch = text.match(/(?:above|over|more than)\s*(\d+)/);
    if (overMatch) {
      filters.minAge = parseInt(overMatch[1]);
      explanations.push(`Age: above ${filters.minAge}`);
      confidence += 0.1;
    }
  }

  // District detection
  for (const [keyword, value] of Object.entries(DISTRICT_KEYWORDS)) {
    if (text.includes(keyword)) {
      filters.district = value;
      explanations.push(`District: ${value}`);
      confidence += 0.1;
      break;
    }
  }

  // Occupation detection
  for (const [keyword, value] of Object.entries(OCCUPATION_KEYWORDS)) {
    if (text.includes(keyword)) {
      filters.occupation = value;
      explanations.push(`Occupation: ${value}`);
      confidence += 0.1;
      break;
    }
  }

  // Religion detection
  for (const [keyword, value] of Object.entries(RELIGION_KEYWORDS)) {
    if (text.includes(keyword)) {
      filters.religion = value;
      explanations.push(`Religion: ${value}`);
      confidence += 0.1;
      break;
    }
  }

  // Education detection
  for (const [keyword, value] of Object.entries(EDUCATION_KEYWORDS)) {
    if (keyword && text.includes(keyword)) {
      filters.education = value;
      explanations.push(`Education: ${value}`);
      confidence += 0.1;
      break;
    }
  }

  // Food preference
  for (const [keyword, value] of Object.entries(FOOD_KEYWORDS)) {
    if (text.includes(keyword)) {
      filters.food = value;
      explanations.push(`Food: ${value}`);
      confidence += 0.05;
      break;
    }
  }

  // Marital status
  for (const [keyword, value] of Object.entries(MARITAL_KEYWORDS)) {
    if (text.includes(keyword)) {
      filters.maritalStatus = value;
      explanations.push(`Marital status: ${value}`);
      confidence += 0.05;
      break;
    }
  }

  // Premium detection
  if (text.includes("premium") || text.includes("gold") || text.includes("ப்ரீமியம்")) {
    filters.premium = true;
    explanations.push("Premium members only");
    confidence += 0.1;
  }

  // Verified detection
  if (text.includes("verified") || text.includes("சரிபார்க்கப்பட்ட")) {
    filters.verified = true;
    explanations.push("Verified profiles only");
    confidence += 0.05;
  }

  // With photo
  if (text.includes("photo") || text.includes("picture") || text.includes("படம்")) {
    filters.withPhoto = true;
    explanations.push("Profiles with photo");
    confidence += 0.05;
  }

  // Recently joined
  if (text.includes("recent") || text.includes("new") || text.includes("புதிய")) {
    filters.recentlyJoined = true;
    explanations.push("Recently joined");
    confidence += 0.05;
  }

  // Height detection: "5'6\"", "5 feet 6", "taller than 5'8\""
  const heightMatch = text.match(/(\d)[''′]\s*(\d{1,2})/);
  if (heightMatch) {
    filters.height = `${heightMatch[1]}'${heightMatch[2]}"`;
    explanations.push(`Height: ${filters.height}`);
    confidence += 0.05;
  }

  confidence = Math.min(confidence, 0.98);

  return {
    filters,
    explanation: explanations.length > 0 ? `Found: ${explanations.join(", ")}` : "No specific filters detected - showing all profiles",
    confidence,
  };
}

/**
 * Get search suggestions based on partial input.
 */
export function getSearchSuggestions(input: string): string[] {
  const suggestions: string[] = [];
  const text = input.toLowerCase().trim();

  if (text.length < 2) {
    return [
      "Show software engineers in Chennai",
      "Find premium brides under 27",
      "Show teachers in Coimbatore",
      "Find verified profiles in Madurai",
      "Show Hindu profiles in Salem",
    ];
  }

  if ("software engineer".includes(text) || text.includes("software")) {
    suggestions.push("Show software engineers in Chennai");
  }
  if ("premium".includes(text) || text.includes("premium")) {
    suggestions.push("Find premium brides under 27");
  }
  if ("teacher".includes(text) || text.includes("teacher")) {
    suggestions.push("Show teachers in Coimbatore");
  }
  if ("verified".includes(text) || text.includes("verified")) {
    suggestions.push("Find verified profiles in Madurai");
  }
  if ("chennai".includes(text) || text.includes("chennai")) {
    suggestions.push("Show profiles in Chennai");
  }
  if ("madurai".includes(text) || text.includes("madurai")) {
    suggestions.push("Show profiles in Madurai");
  }

  return suggestions.slice(0, 5);
}
