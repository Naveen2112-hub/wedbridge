export const collections = {
  vendors: "vendors",
  vendorCategories: "vendorCategories",
  vendorBookings: "vendorBookings",
  vendorReviews: "vendorReviews",
  vendorGallery: "vendorGallery",
  vendorPackages: "vendorPackages",
  profiles: "profiles",
} as const;

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
export type VerificationStatus = "unverified" | "verified";
export type ContactVisibility = "everyone" | "after_booking" | "premium_only";

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
