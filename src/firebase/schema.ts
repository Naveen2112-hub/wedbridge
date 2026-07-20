export const collections = {
  users: "users",
  profiles: "profiles",
  interests: "interests",
  favourites: "favourites",
  notifications: "notifications",
  profileViews: "profileViews",
  searchHistory: "searchHistory",
  recentlyViewed: "recentlyViewed",
  aiMatches: "aiMatches",
  matchHistory: "matchHistory",
  subscriptions: "subscriptions",
  payments: "payments",
  membershipHistory: "membershipHistory",
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
export type MembershipTier = "free" | "basic" | "premium" | "gold";

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded" | "expired";

export type PaymentGateway = "razorpay";

export interface PlanInfo {
  id: MembershipTier;
  name: string;
  price: number;
  periodDays: number;
  features: string[];
  highlighted?: boolean;
}

export interface SubscriptionDocument {
  id: string;
  uid: string;
  plan: MembershipTier;
  status: "active" | "expired" | "cancelled";
  startDate: unknown;
  endDate: unknown;
  paymentId?: string;
  autoRenew: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface PaymentDocument {
  id: string;
  uid: string;
  orderId: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  plan: MembershipTier;
  status: PaymentStatus;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  notes?: Record<string, string>;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface MembershipHistoryDocument {
  id: string;
  uid: string;
  fromPlan: MembershipTier | null;
  toPlan: MembershipTier;
  action: "purchase" | "upgrade" | "renew" | "downgrade" | "refund" | "expiry";
  paymentId?: string;
  amount: number;
  createdAt: unknown;
}

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
  viewCount?: number;
  online?: boolean;
  lastActiveAt?: unknown;
  membership?: MembershipTier;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ProfileViewDocument {
  id: string;
  viewerUid: string;
  profileUid: string;
  viewedAt: unknown;
}

export interface SearchHistoryDocument {
  id: string;
  uid: string;
  query: string;
  filters: Record<string, unknown>;
  searchedAt: unknown;
}

export interface RecentlyViewedDocument {
  id: string;
  uid: string;
  profileUid: string;
  viewedAt: unknown;
}

export interface AiMatchDocument {
  id: string;
  uid: string;
  profileUid: string;
  score: number;
  reasons: string[];
  insights: string[];
  generatedAt: unknown;
}

export interface MatchHistoryDocument {
  id: string;
  uid: string;
  profileUid: string;
  score: number;
  action: "viewed" | "interested" | "favourited";
  createdAt: unknown;
}

export type InterestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "expired";

export interface InterestDocument {
  id: string;
  senderId: string;
  receiverId: string;
  status: InterestStatus;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface FavouriteDocument {
  id: string;
  userId: string;
  profileId: string;
  createdAt: unknown;
}

export type NotificationType =
  | "interest_received"
  | "interest_accepted"
  | "interest_rejected"
  | "profile_viewed"
  | "premium_activated"
  | "new_ai_matches"
  | "new_message"
  | "admin_announcement";

export interface NotificationDocument {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: unknown;
}

export const FREE_PLAN_LIMITS = {
  interestsPerDay: 20,
  contactViewsPerDay: 5,
} as const;

export const PLAN_LIMITS: Record<MembershipTier, { interestsPerDay: number; contactViewsPerDay: number; priorityRanking: boolean; featured: boolean; ads: boolean }> = {
  free: { interestsPerDay: 20, contactViewsPerDay: 5, priorityRanking: false, featured: false, ads: true },
  basic: { interestsPerDay: Infinity, contactViewsPerDay: 20, priorityRanking: true, featured: false, ads: false },
  premium: { interestsPerDay: Infinity, contactViewsPerDay: Infinity, priorityRanking: true, featured: true, ads: false },
  gold: { interestsPerDay: Infinity, contactViewsPerDay: Infinity, priorityRanking: true, featured: true, ads: false },
};

export const MEMBERSHIP_PLANS: PlanInfo[] = [
  { id: "free", name: "Free", price: 0, periodDays: 0, features: ["Unlimited registration & login", "Unlimited profile search", "Unlimited AI recommendations", "20 interests per day", "5 contact views per day"] },
  { id: "basic", name: "Basic", price: 999, periodDays: 90, features: ["Unlimited interests", "20 contact views per day", "Priority search ranking", "No advertisements"] },
  { id: "premium", name: "Premium", price: 2999, periodDays: 180, highlighted: true, features: ["Unlimited contact views", "Unlimited interests", "Unlimited AI matches", "Priority search ranking", "Premium badge", "Highlighted profile"] },
  { id: "gold", name: "Gold", price: 5999, periodDays: 365, features: ["Everything in Premium", "Highest search priority", "Top featured profile", "Exclusive wedding vendor discounts", "Early access to new features"] },
];

export function planRank(tier: MembershipTier): number {
  return { free: 0, basic: 1, premium: 2, gold: 3 }[tier];
}

export const REQUIRED_PROFILE_FIELDS: (keyof ProfileDocument)[] = [
  "photoURL", "name", "gender", "dateOfBirth", "religion", "caste", "motherTongue",
  "district", "state", "country", "phone", "maritalStatus", "height", "education", "occupation", "annualIncome",
];

export const OPTIONAL_PROFILE_FIELDS: (keyof ProfileDocument)[] = [
  "fatherName", "motherName", "brothers", "sisters", "familyType", "familyStatus",
  "lifestyle", "foodPreference", "smoking", "drinking", "horoscope", "star", "rasi",
  "manglik", "aboutMe", "partnerPreference",
];
