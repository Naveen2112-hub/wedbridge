import type { FieldKey } from "./ocrTypes";

export interface FieldPattern {
  key: FieldKey;
  patterns: RegExp[];
  /** Base confidence when matched via label pattern */
  baseConfidence?: number;
}

const TEXT = "[\\p{L}\\p{N} .,'/-]{2,80}";
const LONG_TEXT = "[\\p{L}\\p{N} .,'/-]{5,200}";

export const FIELD_PATTERNS: FieldPattern[] = [
  {
    key: "name",
    baseConfidence: 0.8,
    patterns: [
      new RegExp(`(?:Name|Bride Name|Groom Name|Profile Name)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`பெயர்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`పేరు\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಹೆಸರು\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`नाम\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "dateOfBirth",
    baseConfidence: 0.85,
    patterns: [
      /(?:DOB|Date of Birth|Born on)\s*[:\-]\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
      /பிறந்த தேதி\s*[:\-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
      /పుట్టిన తేదీ\s*[:\-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
      /ಹುಟ್ಟಿದ ದಿನಾಂಕ\s*[:\-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
      /जन्म तिथि\s*[:\-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
    ],
  },
  {
    key: "age",
    baseConfidence: 0.8,
    patterns: [
      /(?:Age|Years)\s*[:\-]\s*(\d{1,3})\s*(?:yrs?|years)?/i,
      /வயது\s*[:\-]?\s*(\d{1,3})/i,
      /వయస్సు\s*[:\-]?\s*(\d{1,3})/i,
      /ವಯಸ್ಸು\s*[:\-]?\s*(\d{1,3})/i,
      /उम्र\s*[:\-]?\s*(\d{1,3})/i,
    ],
  },
  {
    key: "height",
    baseConfidence: 0.8,
    patterns: [
      /(?:Height)\s*[:\-]\s*(\d{1,2}'?\s?\d{1,2}"?|\d{3}\s?cm)/i,
      /உயரம்\s*[:\-]?\s*(\d{1,2}'?\s?\d{1,2}"?|\d{3}\s?cm)/i,
      /ఎత్తు\s*[:\-]?\s*(\d{1,2}'?\s?\d{1,2}"?|\d{3}\s?cm)/i,
      /ಎತ್ತರ\s*[:\-]?\s*(\d{1,2}'?\s?\d{1,2}"?|\d{3}\s?cm)/i,
      /ऊँचाई\s*[:\-]?\s*(\d{1,2}'?\s?\d{1,2}"?|\d{3}\s?cm)/i,
    ],
  },
  {
    key: "weight",
    baseConfidence: 0.75,
    patterns: [
      /(?:Weight)\s*[:\-]\s*(\d{2,3}\s?(?:kg|kgs|lb|lbs)?)/i,
      /எடை\s*[:\-]?\s*(\d{2,3}\s?(?:kg|kgs|lb|lbs)?)/i,
      /బరువు\s*[:\-]?\s*(\d{2,3}\s?(?:kg|kgs|lb|lbs)?)/i,
      /ತೂಕ\s*[:\-]?\s*(\d{2,3}\s?(?:kg|kgs|lb|lbs)?)/i,
      /वजन\s*[:\-]?\s*(\d{2,3}\s?(?:kg|kgs|lb|lbs)?)/i,
    ],
  },
  {
    key: "education",
    baseConfidence: 0.78,
    patterns: [
      new RegExp(`(?:Education|Qualification|Educational Qualification)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`கல்வி\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`విద్య\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ವಿದ್ಯಾಭ್ಯಾಸ\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`शिक्षा\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "occupation",
    baseConfidence: 0.75,
    patterns: [
      new RegExp(`(?:Occupation|Profession|Job|Designation|Employment)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`தொழில்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`వృత్తి\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಉದ್ಯೋಗ\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`व्यवसाय\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "annualIncome",
    baseConfidence: 0.7,
    patterns: [
      /(?:Income|Annual Income|Salary|Annual Salary)\s*[:\-]\s*(₹?\s?[\d,]+\s?(?:lakh|lakhs|crore|cr|L|pa|p\.a)?)/i,
      /வருமானம்\s*[:\-]?\s*(₹?\s?[\d,]+)/i,
      /ఆదాయం\s*[:\-]?\s*(₹?\s?[\d,]+)/i,
      /ಆದಾಯ\s*[:\-]?\s*(₹?\s?[\d,]+)/i,
      /आय\ सं\s*[:\-]?\s*(₹?\s?[\d,]+)/i,
    ],
  },
  {
    key: "fatherName",
    baseConfidence: 0.72,
    patterns: [
      new RegExp(`(?:Father(?:'s)? Name|Father)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`தந்தை பெயர்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`తండ్రి పేరు\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ತಂದೆಯ ಹೆಸರು\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`पिता का नाम\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "motherName",
    baseConfidence: 0.72,
    patterns: [
      new RegExp(`(?:Mother(?:'s)? Name|Mother)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`தாய் பெயர்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`తల్లి పేరు\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ತಾಯಿಯ ಹೆಸರು\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`माता का नाम\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "siblings",
    baseConfidence: 0.65,
    patterns: [
      /(?:Siblings|Brothers and Sisters|No\. of Siblings)\s*[:\-]\s*(\d+\s?(?:brothers?)?[\s,]*\d?\s?(?:sisters?)?)/i,
      /(?:Siblings)\s*[:\-]\s*([\p{L}\p{N} ,]{3,60})/iu,
      new RegExp(`சகோதரர்கள்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`సోదరులు\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಒಡಹುಟ್ಟುವರು\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`भाई-बहन\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "religion",
    baseConfidence: 0.82,
    patterns: [
      new RegExp(`(?:Religion|Faith)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`மதம்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`మతం\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಧರ್ಮ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`धर्म\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "caste",
    baseConfidence: 0.78,
    patterns: [
      new RegExp(`(?:Caste|Community)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`சாதி\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`కులం\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಜಾತಿ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`जाति\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "subCaste",
    baseConfidence: 0.7,
    patterns: [
      new RegExp(`(?:Sub\\s*Caste|Sub-?Caste|Sect)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`உட்சாதி\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ఉప కులం\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಉಪ ಜಾತಿ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`उपजाति\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "gothram",
    baseConfidence: 0.72,
    patterns: [
      new RegExp(`(?:Gothram|Gothra|Gotra)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`கோத்திரம்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`గోత్రం\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಗೋತ್ರ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`गोत्र\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "star",
    baseConfidence: 0.75,
    patterns: [
      new RegExp(`(?:Star|Birth Star|Nakshatra)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`நட்சத்திரம்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`జన్మ నక్షత్రం\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ನಕ್ಷತ್ರ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`नक्षत्र\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "rasi",
    baseConfidence: 0.75,
    patterns: [
      new RegExp(`(?:Rasi|Rashi|Moon Sign|Zodiac Sign)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`ராசி\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`రాశి\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ರಾಶಿ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`राशि\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "dosham",
    baseConfidence: 0.68,
    patterns: [
      new RegExp(`(?:Dosham|Dosha|Manglik|Sevvai)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`தோஷம்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`దోషం\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ದೋಷ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`दोष\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "nativePlace",
    baseConfidence: 0.7,
    patterns: [
      new RegExp(`(?:Native Place|Native|Home Town|Hometown)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`சொந்த ஊர்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`స్వంత ఊరు\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಸ್ವಂತ ಊರು\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`जन्म स्थान\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "district",
    baseConfidence: 0.72,
    patterns: [
      new RegExp(`(?:District|City)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`மாவட்டம்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`జిల్లా\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ಜಿಲ್ಲೆ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`जिला\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "state",
    baseConfidence: 0.72,
    patterns: [
      new RegExp(`(?:State|Province)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`மாநிலம்\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`రాష్ట్రం\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ರಾಜ್ಯ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`राज्य\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "country",
    baseConfidence: 0.75,
    patterns: [
      new RegExp(`(?:Country|Nationality)\\s*[:\\-]\\s*(${TEXT})`, "iu"),
      new RegExp(`நாடு\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`దేశం\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
      new RegExp(`ದೇಶ\s*[:\-]?\s*(${TEXT})`, "iu"),
      new RegExp(`देश\\s*[:\\-]?\\s*(${TEXT})`, "iu"),
    ],
  },
  {
    key: "phone",
    baseConfidence: 0.85,
    patterns: [
      /(?:Phone|Mobile|Contact|Phone No|Mobile No)\s*[:\-]\s*(\+?\d[\d\s\-]{8,14}\d)/i,
      /(\+?91[\d\s\-]{10,12})/,
      /(\+?\d[\d\s\-]{8,14}\d)/,
    ],
  },
  {
    key: "email",
    baseConfidence: 0.9,
    patterns: [
      /(?:Email|E-mail|Email Address)\s*[:\-]\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
      /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/,
    ],
  },
  {
    key: "address",
    baseConfidence: 0.65,
    patterns: [
      new RegExp(`(?:Address|Residential Address)\\s*[:\\-]\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`முகவரி\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`చిరునామా\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`ವಿಳಾಸ\s*[:\-]?\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`पता\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
    ],
  },
  {
    key: "expectations",
    baseConfidence: 0.6,
    patterns: [
      new RegExp(`(?:Expectations?|Our Expectations?)\\s*[:\\-]\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`எதிர்பார்ப்பு\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`అపేక్షలు\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`ನಿರೀಕ್ಷೆಗಳು\s*[:\-]?\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`अपेक्षाएं\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
    ],
  },
  {
    key: "hobbies",
    baseConfidence: 0.6,
    patterns: [
      new RegExp(`(?:Hobbies?|Interests?)\\s*[:\\-]\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`பொழுதுபோக்கு\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`అభిరుచులు\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`ಹವ್ಯಾಸಗಳು\s*[:\-]?\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`शौक\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
    ],
  },
  {
    key: "partnerPreference",
    baseConfidence: 0.62,
    patterns: [
      new RegExp(`(?:Partner Preference|Partner Expectations?|Expected Partner|Looking For)\\s*[:\\-]\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`வாழ்க்கைத் துணை விருப்பம்\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`భాగస్వామ్య ప్రాధాన్యత\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`ಜೀವನ ಸಂಗಾತಿ ಆದ್ಯತೆ\s*[:\-]?\s*(${LONG_TEXT})`, "iu"),
      new RegExp(`जीवनसाथी पसंद\\s*[:\\-]?\\s*(${LONG_TEXT})`, "iu"),
    ],
  },
];
