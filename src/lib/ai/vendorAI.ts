/**
 * Vendor AI Service
 * Recommends and ranks vendors using ratings, budget, distance, availability, popularity.
 */
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { collections, type VendorDocument, type VendorCategory } from "@/firebase/schema";

export interface VendorRanking {
  vendor: VendorDocument & { id: string };
  score: number;
  rank: number;
  reasons: string[];
}

export interface VendorSearchCriteria {
  category?: VendorCategory;
  district?: string;
  state?: string;
  maxBudget?: number;
  minRating?: number;
  availableDate?: string;
}

/**
 * Rank vendors by composite score: ratings, budget fit, distance, popularity.
 */
export function rankVendors(
  vendors: (VendorDocument & { id: string })[],
  criteria: VendorSearchCriteria,
): VendorRanking[] {
  const ranked = vendors.map((vendor) => {
    let score = 0;
    const reasons: string[] = [];

    // Rating score (0-30 points)
    const ratingScore = (vendor.rating ?? 0) * 6;
    score += ratingScore;
    if (vendor.rating >= 4.5) reasons.push("Excellent rating");

    // Budget fit (0-25 points)
    if (criteria.maxBudget && vendor.startingPrice <= criteria.maxBudget) {
      score += 25;
      reasons.push("Within budget");
    } else if (criteria.maxBudget && vendor.startingPrice <= criteria.maxBudget * 1.2) {
      score += 15;
      reasons.push("Slightly above budget");
    } else if (!criteria.maxBudget) {
      score += 10;
    }

    // Distance/location (0-20 points)
    if (criteria.district && vendor.district === criteria.district) {
      score += 20;
      reasons.push("Same district");
    } else if (criteria.state && vendor.state === criteria.state) {
      score += 12;
      reasons.push("Same state");
    } else {
      score += 5;
    }

    // Popularity (0-15 points)
    const popularityScore = Math.min((vendor.reviewCount ?? 0) / 10, 15);
    score += popularityScore;
    if (vendor.reviewCount > 50) reasons.push("Highly reviewed");

    // Featured (0-10 points)
    if (vendor.featured) {
      score += 10;
      reasons.push("Featured vendor");
    }

    return { vendor, score: Math.round(score), rank: 0, reasons };
  });

  ranked.sort((a, b) => b.score - a.score);
  ranked.forEach((r, i) => { r.rank = i + 1; });

  return ranked;
}

/**
 * Search and rank vendors based on criteria.
 */
export async function searchAndRankVendors(
  criteria: VendorSearchCriteria,
): Promise<VendorRanking[]> {
  if (!db) return [];
  try {
    let q;
    const constraints = [];
    if (criteria.category) constraints.push(where("category", "==", criteria.category));
    if (criteria.district) constraints.push(where("district", "==", criteria.district));
    if (criteria.state) constraints.push(where("state", "==", criteria.state));
    constraints.push(orderBy("rating", "desc"));
    constraints.push(limit(50));

    q = query(collection(db, collections.vendors), ...constraints);
    const snap = await getDocs(q);
    const vendors = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorDocument, "id">) }));

    return rankVendors(vendors, criteria);
  } catch {
    return [];
  }
}

/**
 * Get top vendors by category.
 */
export async function getTopVendorsByCategory(category: VendorCategory, max = 5): Promise<VendorRanking[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.vendors), where("category", "==", category), orderBy("rating", "desc"), limit(max * 2)));
    const vendors = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorDocument, "id">) }));
    return rankVendors(vendors, { category }).slice(0, max);
  } catch {
    return [];
  }
}
