import type { FieldKey } from "./ocrTypes";

export interface FieldLabel {
  key: FieldKey;
  /** All known labels for this field across English + Tamil + templates */
  labels: string[];
  /** Tamil labels for this field */
  tamilLabels: string[];
  /** Value type hint for extraction validation */
  type: "text" | "number" | "date" | "phone" | "email" | "longtext";
  /** Base confidence when matched via label */
  baseConfidence: number;
}

export const FIELD_LABELS: FieldLabel[] = [
  { key: "name", type: "text", baseConfidence: 0.82, labels: ["name", "bride name", "groom name", "profile name", "candidate name", "person name", "full name"], tamilLabels: ["பெயர்", "மணமகன் பெயர்", "மணமகள் பெயர்"] },
  { key: "dateOfBirth", type: "date", baseConfidence: 0.85, labels: ["dob", "date of birth", "born on", "birth date", "birthday"], tamilLabels: ["பிறந்த தேதி", "பிறந்த நாள்"] },
  { key: "age", type: "number", baseConfidence: 0.80, labels: ["age", "years", "years old"], tamilLabels: ["வயது"] },
  { key: "height", type: "text", baseConfidence: 0.80, labels: ["height"], tamilLabels: ["உயரம்"] },
  { key: "weight", type: "text", baseConfidence: 0.75, labels: ["weight", "body weight"], tamilLabels: ["எடை"] },
  { key: "education", type: "text", baseConfidence: 0.78, labels: ["education", "qualification", "educational qualification", "education qualification", "degree", "qualification details"], tamilLabels: ["கல்வி", "கல்வித் தகுதி"] },
  { key: "occupation", type: "text", baseConfidence: 0.75, labels: ["occupation", "profession", "job", "designation", "employment", "working as", "profession details", "working in", "currently working", "position", "role"], tamilLabels: ["தொழில்", "தொழில் விவரம்", "வேலை", "பணி"] },
  { key: "company", type: "text", baseConfidence: 0.72, labels: ["company", "company name", "organization", "organisation", "firm", "employer", "working at", "company details", "workplace"], tamilLabels: ["நிறுவனம்", "நிறுவனத்தின் பெயர்"] },
  { key: "annualIncome", type: "text", baseConfidence: 0.70, labels: ["income", "annual income", "salary", "annual salary", "monthly income", "income per annum", "annual ctc", "ctc", "earning", "earnings"], tamilLabels: ["வருமானம்", "ஆண்டு வருமானம்", "சம்பளம்"] },
  { key: "fatherName", type: "text", baseConfidence: 0.72, labels: ["father", "father's name", "father name", "fathers name"], tamilLabels: ["தந்தை பெயர்", "தந்தையார் பெயர்"] },
  { key: "motherName", type: "text", baseConfidence: 0.72, labels: ["mother", "mother's name", "mother name", "mothers name"], tamilLabels: ["தாய் பெயர்", "தாயார் பெயர்"] },
  { key: "siblings", type: "text", baseConfidence: 0.65, labels: ["siblings", "brothers and sisters", "no of siblings", "brothers", "sisters", "no of brothers", "no of sisters", "family details"], tamilLabels: ["சகோதரர்கள்", "சகோதரிகள்", "உடன்பிறந்தவர்கள்"] },
  { key: "religion", type: "text", baseConfidence: 0.82, labels: ["religion", "faith", "community"], tamilLabels: ["மதம்"] },
  { key: "caste", type: "text", baseConfidence: 0.78, labels: ["caste", "community", "caste category"], tamilLabels: ["சாதி", "சமூகம்"] },
  { key: "subCaste", type: "text", baseConfidence: 0.70, labels: ["sub caste", "sub-caste", "sect", "subsect"], tamilLabels: ["உட்சாதி", "பிரிவு"] },
  { key: "gothram", type: "text", baseConfidence: 0.72, labels: ["gothram", "gothra", "gotra", "gothiram"], tamilLabels: ["கோத்திரம்"] },
  { key: "star", type: "text", baseConfidence: 0.75, labels: ["star", "birth star", "nakshatra", "nakshatram", "janma nakshatra"], tamilLabels: ["நட்சத்திரம்", "ஜென்ம நட்சத்திரம்"] },
  { key: "rasi", type: "text", baseConfidence: 0.75, labels: ["rasi", "rashi", "moon sign", "zodiac sign", "zodiac"], tamilLabels: ["ராசி", "சந்திர ராசி"] },
  { key: "dosham", type: "text", baseConfidence: 0.68, labels: ["dosham", "dosha", "manglik", "sevvai", "chevvai", "sevai"], tamilLabels: ["தோஷம்", "செவ்வாய் தோஷம்"] },
  { key: "nativePlace", type: "text", baseConfidence: 0.70, labels: ["native", "native place", "home town", "hometown", "native location"], tamilLabels: ["சொந்த ஊர்"] },
  { key: "district", type: "text", baseConfidence: 0.72, labels: ["district", "city", "town"], tamilLabels: ["மாவட்டம்", "நகரம்"] },
  { key: "state", type: "text", baseConfidence: 0.72, labels: ["state", "province", "region"], tamilLabels: ["மாநிலம்"] },
  { key: "country", type: "text", baseConfidence: 0.75, labels: ["country", "nationality"], tamilLabels: ["நாடு", "தேசியம்"] },
  { key: "phone", type: "phone", baseConfidence: 0.85, labels: ["phone", "mobile", "contact", "phone no", "mobile no", "contact number", "phone number", "mobile number", "ph", "ph no", "contact no", "cell", "cell no"], tamilLabels: ["தொலைபேசி", "அலைபேசி", "தொடர்பு எண்", "செல்பேசி", "மொபைல்"] },
  { key: "whatsapp", type: "phone", baseConfidence: 0.82, labels: ["whatsapp", "whatsapp number", "whatsapp no", "whatsapp number"], tamilLabels: ["வாட்ஸ்அப்", "வாட்ஸ்அப் எண்"] },
  { key: "email", type: "email", baseConfidence: 0.90, labels: ["email", "e-mail", "email address", "mail", "email id"], tamilLabels: ["மின்னஞ்சல்", "மின்னஞ்சல் முகவரி"] },
  { key: "address", type: "longtext", baseConfidence: 0.65, labels: ["address", "residential address", "full address", "home address"], tamilLabels: ["முகவரி", "வீட்டு முகவரி"] },
  { key: "expectations", type: "longtext", baseConfidence: 0.60, labels: ["expectations", "our expectations", "expectation", "expectations from bride", "expectations from groom"], tamilLabels: ["எதிர்பார்ப்பு", "எதிர்பார்ப்புகள்"] },
  { key: "hobbies", type: "longtext", baseConfidence: 0.60, labels: ["hobbies", "interests", "hobby", "hobbies and interests"], tamilLabels: ["பொழுதுபோக்கு", "விருப்பங்கள்"] },
  { key: "partnerPreference", type: "longtext", baseConfidence: 0.62, labels: ["partner preference", "partner expectations", "expected partner", "looking for", "partner expectation", "bride preference", "groom preference", "life partner preference"], tamilLabels: ["வாழ்க்கைத் துணை விருப்பம்", "துணை எதிர்பார்ப்பு"] },
];

export const ALL_FIELD_KEYS: FieldKey[] = FIELD_LABELS.map((f) => f.key);

export function getLabelByKey(key: FieldKey): FieldLabel | undefined {
  return FIELD_LABELS.find((f) => f.key === key);
}
