export const collections = {
  users: "users",
  profiles: "profiles",
  matches: "matches",
  interests: "interests",
  favourites: "favourites",
  notifications: "notifications",
  subscriptions: "subscriptions",
  vendors: "vendors",
  vendorBookings: "vendorBookings",
  reviews: "reviews",
  successStories: "successStories",
} as const;

export type CollectionName = (typeof collections)[keyof typeof collections];

export type UserRole = "user" | "admin";

export type Gender = "male" | "female" | "other";

export type ProfileStatus = "incomplete" | "pending" | "approved" | "rejected";

export type ContactVisibility = "everyone" | "after_accept" | "premium_only";

export type Language = "en" | "ta";

export const languages: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
];

export interface BaseDocument {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserDocument extends BaseDocument {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  gender?: Gender | null;
  profileCompleted: boolean;
  photoURL?: string;
  contactVisibility?: ContactVisibility;
  language: Language;
}

export interface ProfileDocument extends BaseDocument {
  uid: string;
  fullName: string;
  gender: Gender;
  dateOfBirth?: string;
  religion?: string;
  caste?: string;
  district?: string;
  phone?: string;
  email?: string;
  photoURL?: string;
  age?: number;
  height?: string;
  motherTongue?: string;
  profession?: string;
  education?: string;
  location?: string;
  income?: string;
  maritalStatus?: string;
  bio?: string;
  photos: string[];
  bioDataUrl?: string;
  ocrStatus?: "pending" | "verified" | "rejected";
  status: ProfileStatus;
  isPremium: boolean;
  contactVisible: boolean;
  contactVisibility: ContactVisibility;
  preferences?: {
    ageRange?: [number, number];
    religion?: string;
    motherTongue?: string;
    location?: string;
  };
}

export const FREE_PLAN_LIMITS = {
  interestRequestsPerDay: 20,
  contactDetailViewsPerDay: 5,
  aiRecommendations: "unlimited" as const,
  registration: "unlimited" as const,
  login: "unlimited" as const,
  profileViews: "unlimited" as const,
};
