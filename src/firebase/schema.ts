export const collections = {
  users: "users",
  profiles: "profiles",
  vendors: "vendors",
  vendorCategories: "vendorCategories",
  vendorBookings: "vendorBookings",
  vendorReviews: "vendorReviews",
  vendorGallery: "vendorGallery",
  vendorPackages: "vendorPackages",
  payments: "payments",
  subscriptions: "subscriptions",
  interests: "interests",
  notifications: "notifications",
  auditLog: "auditLog",
  settings: "settings",
  favourites: "favourites",
  aiMatches: "aiMatches",
  matchHistory: "matchHistory",
  profileViews: "profileViews",
  recentlyViewed: "recentlyViewed",
  searchHistory: "searchHistory",
  telegramSettings: "telegram_settings",
  telegramLogs: "telegram_logs",
  telegramQueue: "telegram_queue",
  broadcasts: "broadcasts",
  notificationTemplates: "notification_templates",
  ocrImports: "ocr_imports",
} as const;

export type UserRole = "user" | "admin" | "vendor";

export type Gender = "male" | "female" | "other";

export type MaritalStatus = "never_married" | "divorced" | "widowed" | "awaiting_divorce";

export type Language = "en" | "ta";

export type MembershipTier = "free" | "basic" | "premium" | "gold" | "elite";

export type InterestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "expired";

export type PaymentStatus = "pending" | "paid" | "verified" | "refunded" | "failed" | "cancelled";

export type PaymentGateway = "razorpay" | "manual" | "stripe";

export type NotificationType =
  | "interest_received"
  | "interest_accepted"
  | "interest_rejected"
  | "message"
  | "system"
  | "payment"
  | "membership"
  | "vendor_booking"
  | "admin_broadcast"
  | "premium_activated"
  | "profile_viewed"
  | "new_ai_matches"
  | "new_message"
  | "admin_announcement";

export type VerificationStatus = "unverified" | "verified" | "pending" | "rejected";

export type ContactVisibility = "everyone" | "after_accept" | "after_booking" | "premium_only";

export type ProfileVisibility = "visible" | "hidden";

export type AccountStatus = "active" | "deactivated" | "suspended";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: "active" | "blocked";
  verified: boolean;
  gender?: Gender | null;
  membershipTier?: MembershipTier;
  name?: string;
  phone?: string;
  photoURL?: string;
  profileCompleted?: boolean;
  contactVisibility?: ContactVisibility;
  language?: Language;
  telegramChatId?: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export type VendorCategory =
  | "marriage_halls"
  | "photographers"
  | "videographers"
  | "catering"
  | "decorators"
  | "makeup_artists"
  | "bridal_wear"
  | "groom_wear"
  | "jewellery"
  | "invitation_designers"
  | "wedding_planners"
  | "flower_decoration"
  | "music_dj"
  | "travel_transport"
  | "mehendi_artists"
  | "priest_purohit"
  | "stage_decoration"
  | "return_gifts"
  | "wedding_cakes"
  | "live_streaming";

export const VENDOR_CATEGORIES: { id: VendorCategory; name: string; icon: string }[] = [
  { id: "marriage_halls", name: "Marriage Halls", icon: "Building2" },
  { id: "photographers", name: "Photographers", icon: "Camera" },
  { id: "videographers", name: "Videographers", icon: "Video" },
  { id: "catering", name: "Catering", icon: "UtensilsCrossed" },
  { id: "decorators", name: "Decorators", icon: "Sparkles" },
  { id: "makeup_artists", name: "Makeup Artists", icon: "Brush" },
  { id: "bridal_wear", name: "Bridal Wear", icon: "Shirt" },
  { id: "groom_wear", name: "Groom Wear", icon: "Shirt" },
  { id: "jewellery", name: "Jewellery", icon: "Gem" },
  { id: "invitation_designers", name: "Invitation Designers", icon: "Mail" },
  { id: "wedding_planners", name: "Wedding Planners", icon: "CalendarCheck" },
  { id: "flower_decoration", name: "Flower Decoration", icon: "Flower2" },
  { id: "music_dj", name: "Music & DJ", icon: "Music" },
  { id: "travel_transport", name: "Travel & Transport", icon: "Car" },
  { id: "mehendi_artists", name: "Mehendi Artists", icon: "Hand" },
  { id: "priest_purohit", name: "Priest / Purohit", icon: "Church" },
  { id: "stage_decoration", name: "Stage Decoration", icon: "Sparkles" },
  { id: "return_gifts", name: "Return Gifts", icon: "Gift" },
  { id: "wedding_cakes", name: "Wedding Cakes", icon: "Cake" },
  { id: "live_streaming", name: "Live Streaming", icon: "Radio" },
];

export function getCategoryName(id: VendorCategory): string {
  return VENDOR_CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export interface VendorDocument {
  id: string;
  ownerUid: string;
  businessName: string;
  category: VendorCategory;
  logoURL: string;
  coverURL: string;
  about: string;
  city: string;
  district: string;
  state: string;
  location: { lat: number; lng: number } | null;
  phone: string;
  email: string;
  website?: string;
  businessHours?: { days: string; hours: string };
  startingPrice: number;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  status: VendorStatus;
  verificationStatus: VerificationStatus;
  contactVisibility: ContactVisibility;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface VendorPackageDocument {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  inclusions: string[];
  createdAt: unknown;
}

export interface VendorGalleryDocument {
  id: string;
  vendorId: string;
  imageURL: string;
  caption?: string;
  createdAt: unknown;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface VendorBookingDocument {
  id: string;
  vendorId: string;
  vendorName: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageId?: string;
  preferredDate: unknown;
  time: string;
  guestCount: number;
  specialNotes?: string;
  status: BookingStatus;
  amount: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface VendorReviewDocument {
  id: string;
  vendorId: string;
  userId: string;
  userName: string;
  rating: number;
  review: string;
  verifiedBooking: boolean;
  reported: boolean;
  createdAt: unknown;
}

export interface ProfileDocument {
  id?: string;
  uid: string;
  userId?: string;
  name: string;
  gender: Gender;
  dateOfBirth: string;
  dob?: string;
  religion: string;
  caste?: string;
  motherTongue?: string;
  education?: string;
  occupation?: string;
  income?: string;
  annualIncome?: string;
  phone?: string;
  email?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  height?: string;
  weight?: string;
  maritalStatus?: string;
  familyType?: string;
  bio?: string;
  photoURL?: string;
  photoURLs?: string[];
  gallery?: string[];
  status: "pending" | "approved" | "rejected" | "hidden";
  premium?: boolean;
  verified?: boolean;
  featured: boolean;
  verificationStatus?: VerificationStatus;
  membership?: MembershipTier;
  contactVisibility?: ContactVisibility;
  profileVisibility?: ProfileVisibility;
  accountStatus?: AccountStatus;
  viewCount?: number;
  online?: boolean;
  lastActiveAt?: unknown;
  horoscope?: string;
  star?: string;
  rasi?: string;
  manglik?: string;
  partnerPreference?: string;
  lifestyle?: string;
  foodPreference?: string;
  smoking?: string;
  drinking?: string;
  createdBy: "user" | "admin" | "ocr" | "bulk";
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface InterestDocument {
  id: string;
  senderId?: string;
  receiverId?: string;
  fromUserId?: string;
  fromUserName?: string;
  toUserId?: string;
  toProfileId?: string;
  status: InterestStatus;
  message?: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface PaymentDocument {
  id: string;
  uid?: string;
  userId?: string;
  userName?: string;
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  gateway?: PaymentGateway;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  amount: number;
  currency?: string;
  plan: MembershipTier | string;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  notes?: Record<string, string>;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface SubscriptionDocument {
  id: string;
  uid: string;
  userId?: string;
  plan: MembershipTier;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: unknown;
  endDate?: unknown;
  paymentId?: string;
  autoRenew?: boolean;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface NotificationDocument {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  target?: "all" | "premium" | "free" | "vendors";
  read?: boolean;
  metadata?: Record<string, unknown>;
  sentBy: string;
  createdAt: unknown;
}

export interface AuditLogEntry {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  target: string;
  details?: string;
  createdAt: unknown;
}

export interface FavouriteDocument {
  id: string;
  userId: string;
  profileId: string;
  createdAt: unknown;
}

export interface AiMatchDocument {
  id: string;
  uid: string;
  profileUid: string;
  score: number;
  reasons?: string[];
  insights?: string[];
  generatedAt: unknown;
}

export interface MatchHistoryDocument {
  id: string;
  uid: string;
  profileUid: string;
  score: number;
  action: "viewed" | "liked" | "passed" | "interest_sent" | "favourited";
  createdAt: unknown;
}

export interface ProfileViewDocument {
  id: string;
  viewerUid: string;
  profileUid: string;
  viewedAt: unknown;
}

export interface RecentlyViewedDocument {
  id: string;
  uid: string;
  profileUid: string;
  viewedAt: unknown;
}

export interface SearchHistoryDocument {
  id: string;
  uid: string;
  query: string;
  filters?: Record<string, unknown>;
  searchedAt: unknown;
}

export interface SiteSettings {
  websiteName: string;
  logoURL: string;
  bannerURL: string;
  supportPhone: string;
  supportEmail: string;
  socialLinks: { facebook?: string; instagram?: string; twitter?: string; youtube?: string };
  membershipPricing: { premium: number; gold: number };
  homepageBanners: string[];
}

export const defaultSettings: SiteSettings = {
  websiteName: "WedBridge",
  logoURL: "",
  bannerURL: "",
  supportPhone: "",
  supportEmail: "",
  socialLinks: {},
  membershipPricing: { premium: 999, gold: 1999 },
  homepageBanners: [],
};

export interface PlanInfo {
  id: MembershipTier;
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
}

export interface PlanLimits {
  interestsPerDay: number;
  contactViewsPerDay: number;
  aiMatchesPerDay: number;
  photoUploads: number;
  featuredProfile: boolean;
  advancedFilters: boolean;
}

export const PLAN_LIMITS: Record<MembershipTier, PlanLimits> = {
  free: { interestsPerDay: 20, contactViewsPerDay: 0, aiMatchesPerDay: 3, photoUploads: 1, featuredProfile: false, advancedFilters: false },
  basic: { interestsPerDay: 50, contactViewsPerDay: 10, aiMatchesPerDay: 10, photoUploads: 3, featuredProfile: false, advancedFilters: true },
  premium: { interestsPerDay: Infinity, contactViewsPerDay: 50, aiMatchesPerDay: 50, photoUploads: 6, featuredProfile: true, advancedFilters: true },
  gold: { interestsPerDay: Infinity, contactViewsPerDay: Infinity, aiMatchesPerDay: Infinity, photoUploads: 10, featuredProfile: true, advancedFilters: true },
  elite: { interestsPerDay: Infinity, contactViewsPerDay: Infinity, aiMatchesPerDay: Infinity, photoUploads: Infinity, featuredProfile: true, advancedFilters: true },
};

export const MEMBERSHIP_PLANS: PlanInfo[] = [
  { id: "free", name: "Free", price: 0, features: ["Browse profiles", "Send 20 interests/day", "Basic search"] },
  { id: "premium", name: "Premium", price: 999, features: ["View contact details", "Send unlimited interests", "AI matching", "Priority support", "Advanced filters"] },
  { id: "gold", name: "Gold", price: 1999, features: ["All Premium features", "Profile highlighting", "Featured placement", "Dedicated relationship manager", "Background verification", "Exclusive matches"] },
];

export function planRank(tier: MembershipTier): number {
  const ranks: Record<MembershipTier, number> = { free: 0, basic: 1, premium: 2, gold: 3, elite: 4 };
  return ranks[tier] ?? 0;
}
