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

export type Gender = "male" | "female";

export type ProfileStatus = "incomplete" | "pending" | "approved" | "rejected";

export interface BaseDocument {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserDocument extends BaseDocument {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  language: Language;
}

export interface ProfileDocument extends BaseDocument {
  uid: string;
  fullName: string;
  gender: Gender;
  age: number;
  height?: string;
  religion?: string;
  caste?: string;
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
  preferences?: {
    ageRange?: [number, number];
    religion?: string;
    motherTongue?: string;
    location?: string;
  };
}

export type Language = "en" | "ta";

export const languages: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
];
