/**
 * Recommendation Engine
 * Recommends: premium membership, nearby profiles, recently active members,
 * wedding vendors, wedding packages, popular photographers, popular halls.
 */
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { collections, type ProfileDocument, type VendorDocument } from "@/firebase/schema";
import { calculateAge } from "@/lib/format";

export interface Recommendation {
  type: "premium_upgrade" | "nearby_profile" | "active_profile" | "vendor" | "package" | "popular_photographer" | "popular_hall";
  title: string;
  description: string;
  target?: string;
  priority: number;
}

/**
 * Generate personalized recommendations for a user.
 */
export async function getRecommendations(
  uid: string,
  profile?: ProfileDocument,
): Promise<Recommendation[]> {
  const recs: Recommendation[] = [];

  // Premium upgrade recommendation
  if (profile && !profile.membership) {
    recs.push({
      type: "premium_upgrade",
      title: "Upgrade to Premium",
      description: "Unlock unlimited interests, AI matching, and contact details. Starting at ₹999/month.",
      target: "/membership",
      priority: 10,
    });
  }

  // Nearby profiles
  if (profile?.district) {
    const nearby = await getNearbyProfiles(profile.district, uid);
    if (nearby.length > 0) {
      recs.push({
        type: "nearby_profile",
        title: `${nearby.length} profiles near you`,
        description: `Found ${nearby.length} profiles in ${profile.district}. Check them out!`,
        target: "/search",
        priority: 8,
      });
    }
  }

  // Recently active
  const active = await getRecentlyActiveProfiles(uid);
  if (active.length > 0) {
    recs.push({
      type: "active_profile",
      title: "Recently active members",
      description: `${active.length} members were recently active. Send an interest while they're online!`,
      target: "/search",
      priority: 7,
    });
  }

  // Popular vendors
  const popularVendors = await getPopularVendors();
  if (popularVendors.length > 0) {
    const top = popularVendors[0];
    recs.push({
      type: "vendor",
      title: `Top ${top.category?.replace(/_/g, " ") ?? "vendor"}: ${top.businessName}`,
      description: `Rated ${top.rating ?? "N/A"} stars. ${top.reviewCount ?? 0} reviews.`,
      target: `/vendor/${top.id}`,
      priority: 6,
    });
  }

  // Popular photographers
  const photographers = popularVendors.filter((v) => v.category === "photographers");
  if (photographers.length > 0) {
    recs.push({
      type: "popular_photographer",
      title: "Popular Photographer",
      description: `${photographers[0].businessName} - Rated ${photographers[0].rating ?? "N/A"} stars`,
      target: `/vendor/${photographers[0].id}`,
      priority: 5,
    });
  }

  // Popular halls
  const halls = popularVendors.filter((v) => v.category === "marriage_halls");
  if (halls.length > 0) {
    recs.push({
      type: "popular_hall",
      title: "Popular Marriage Hall",
      description: `${halls[0].businessName} - Rated ${halls[0].rating ?? "N/A"} stars`,
      target: `/vendor/${halls[0].id}`,
      priority: 5,
    });
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 6);
}

async function getNearbyProfiles(district: string, excludeUid: string): Promise<ProfileDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.profiles), where("status", "==", "approved"), where("district", "==", district), limit(5)));
    return snap.docs.filter((d) => d.id !== excludeUid).map((d) => ({ uid: d.id, ...(d.data() as Omit<ProfileDocument, "uid">) }));
  } catch {
    return [];
  }
}

async function getRecentlyActiveProfiles(excludeUid: string): Promise<ProfileDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.profiles), where("status", "==", "approved"), limit(10)));
    return snap.docs.filter((d) => d.id !== excludeUid).map((d) => ({ uid: d.id, ...(d.data() as Omit<ProfileDocument, "uid">) }));
  } catch {
    return [];
  }
}

async function getPopularVendors(): Promise<(VendorDocument & { id: string })[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.vendors), orderBy("rating", "desc"), limit(10)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorDocument, "id">) }));
  } catch {
    return [];
  }
}
