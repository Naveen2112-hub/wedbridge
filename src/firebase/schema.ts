export const collections = {
  users: "users",
  profiles: "profiles",
  interests: "interests",
  notifications: "notifications",
} as const;

export const storagePaths = {
  profilePhotos: "profilePhotos",
  documents: "documents",
} as const;

export type UserRole = "user" | "admin";
export type Gender = "male" | "female" | "other";
export type ContactVisibility = "everyone" | "after_accept" | "premium_only";
export type Language = "en" | "ta";
export type MaritalStatus = "never_married" | "divorced" | "widowed" | "awaiting_divorce";
export type FamilyType = "nuclear" | "joint";
export type FamilyStatus = "middle" | "upper_middle" | "rich" | "affluent";
export type FoodPreference = "veg" | "non_veg" | "eggetarian" | "jain";
export type Lifestyle = "moderate" | "traditional" | "modern" | "orthodox";
export type YesNo = "yes" | "no";
export type ProfileVisibility = "visible" | "hidden";
export type AccountStatus = "active" | "deactivated";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface UserDocument {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  gender: Gender | null;
  profileCompleted: boolean;
  photoURL: string;
  contactVisibility: ContactVisibility;
  language: Language;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ProfileDocument {
  uid: string;
  // Required
  photoURL: string;
  name: string;
  gender: Gender;
  dateOfBirth: string;
  religion: string;
  caste: string;
  motherTongue: string;
  district: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  maritalStatus: MaritalStatus;
  height: string;
  education: string;
  occupation: string;
  annualIncome: string;
  // Optional
  fatherName?: string;
  motherName?: string;
  brothers?: string;
  sisters?: string;
  familyType?: FamilyType;
  familyStatus?: FamilyStatus;
  lifestyle?: Lifestyle;
  foodPreference?: FoodPreference;
  smoking?: YesNo;
  drinking?: YesNo;
  horoscope?: YesNo;
  star?: string;
  rasi?: string;
  manglik?: YesNo | "dont_know";
  aboutMe?: string;
  partnerPreference?: string;
  // System
  gallery?: string[];
  contactVisibility: ContactVisibility;
  profileVisibility: ProfileVisibility;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  completedFieldsCount?: number;
  completionPercentage?: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export const FREE_PLAN_LIMITS = {
  interestsPerDay: 20,
  contactViewsPerDay: 5,
} as const;

export const REQUIRED_PROFILE_FIELDS: (keyof ProfileDocument)[] = [
  "photoURL", "name", "gender", "dateOfBirth", "religion", "caste", "motherTongue",
  "district", "state", "country", "phone", "maritalStatus", "height", "education", "occupation", "annualIncome",
];

export const OPTIONAL_PROFILE_FIELDS: (keyof ProfileDocument)[] = [
  "fatherName", "motherName", "brothers", "sisters", "familyType", "familyStatus",
  "lifestyle", "foodPreference", "smoking", "drinking", "horoscope", "star", "rasi",
  "manglik", "aboutMe", "partnerPreference",
];
