/**
 * Comprehensive Analytics Service
 * Dashboard: Users, Revenue, Matches, Success rate, Telegram imports, OCR accuracy,
 * Duplicate rate, Membership sales, Vendor revenue.
 */
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { collections } from "@/firebase/schema";
import { getOcrAnalytics } from "@/lib/ocr/analytics";

export interface DashboardAnalytics {
  users: { total: number; active: number; newToday: number; newThisWeek: number; newThisMonth: number };
  profiles: { total: number; approved: number; pending: number; rejected: number; verified: number; premium: number };
  revenue: { total: number; thisMonth: number; averagePerUser: number; payments: number };
  matches: { totalInterests: number; accepted: number; rejected: number; pending: number; successRate: number };
  ocr: { totalImports: number; successRate: number; avgConfidence: number; duplicateRate: number; avgProcessingTime: number };
  membership: { byPlan: Record<string, { count: number; revenue: number }> };
  vendors: { total: number; featured: number; avgRating: number; totalRevenue: number };
  telegram: { totalImports: number; pending: number; approved: number; duplicates: number };
}

/**
 * Get comprehensive dashboard analytics.
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  if (!db) return emptyAnalytics();

  try {
    const [users, profiles, revenue, matches, ocrAnalytics, vendors] = await Promise.all([
      getUsersAnalytics(),
      getProfilesAnalytics(),
      getRevenueAnalytics(),
      getMatchesAnalytics(),
      getOcrAnalytics(),
      getVendorsAnalytics(),
    ]);

    const membershipByPlan = await getMembershipByPlan();

    return {
      users,
      profiles,
      revenue,
      matches,
      ocr: {
        totalImports: ocrAnalytics.totalImports,
        successRate: ocrAnalytics.successRate,
        avgConfidence: ocrAnalytics.averageConfidence,
        duplicateRate: ocrAnalytics.duplicateRate,
        avgProcessingTime: ocrAnalytics.averageProcessingTimeMs,
      },
      membership: { byPlan: membershipByPlan },
      vendors,
      telegram: {
        totalImports: ocrAnalytics.totalImports,
        pending: ocrAnalytics.pendingCount,
        approved: ocrAnalytics.approvedCount,
        duplicates: ocrAnalytics.duplicateCount,
      },
    };
  } catch {
    return emptyAnalytics();
  }
}

async function getUsersAnalytics(): Promise<DashboardAnalytics["users"]> {
  try {
    const snap = await getDocs(query(collection(db!, collections.users), orderBy("createdAt", "desc"), limit(500)));
    const now = new Date();
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1);

    let newToday = 0, newThisWeek = 0, newThisMonth = 0, active = 0;
    for (const doc of snap.docs) {
      const data = doc.data() as { createdAt?: { seconds?: number }; status?: string };
      const created = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null;
      if (created) {
        if (created >= today) newToday++;
        if (created >= weekAgo) newThisWeek++;
        if (created >= monthAgo) newThisMonth++;
      }
      if (data.status === "active") active++;
    }

    return { total: snap.size, active, newToday, newThisWeek, newThisMonth };
  } catch {
    return { total: 0, active: 0, newToday: 0, newThisWeek: 0, newThisMonth: 0 };
  }
}

async function getProfilesAnalytics(): Promise<DashboardAnalytics["profiles"]> {
  try {
    const snap = await getDocs(query(collection(db!, collections.profiles), limit(1000)));
    let approved = 0, pending = 0, rejected = 0, verified = 0, premium = 0;
    for (const doc of snap.docs) {
      const data = doc.data() as { status?: string; verified?: boolean; membership?: string };
      if (data.status === "approved") approved++;
      else if (data.status === "pending") pending++;
      else if (data.status === "rejected") rejected++;
      if (data.verified) verified++;
      if (data.membership && data.membership !== "free") premium++;
    }
    return { total: snap.size, approved, pending, rejected, verified, premium };
  } catch {
    return { total: 0, approved: 0, pending: 0, rejected: 0, verified: 0, premium: 0 };
  }
}

async function getRevenueAnalytics(): Promise<DashboardAnalytics["revenue"]> {
  try {
    const snap = await getDocs(query(collection(db!, collections.payments), where("status", "==", "success"), limit(1000)));
    const now = new Date(); now.setDate(1);
    let total = 0, thisMonth = 0;
    for (const doc of snap.docs) {
      const data = doc.data() as { amount?: number; createdAt?: { seconds?: number } };
      const amount = data.amount ?? 0;
      total += amount;
      const created = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null;
      if (created && created >= now) thisMonth += amount;
    }
    return {
      total,
      thisMonth,
      averagePerUser: snap.size > 0 ? total / snap.size : 0,
      payments: snap.size,
    };
  } catch {
    return { total: 0, thisMonth: 0, averagePerUser: 0, payments: 0 };
  }
}

async function getMatchesAnalytics(): Promise<DashboardAnalytics["matches"]> {
  try {
    const snap = await getDocs(query(collection(db!, collections.interests), limit(1000)));
    let accepted = 0, rejected = 0, pending = 0;
    for (const doc of snap.docs) {
      const data = doc.data() as { status?: string };
      if (data.status === "accepted") accepted++;
      else if (data.status === "rejected") rejected++;
      else if (data.status === "pending") pending++;
    }
    const total = snap.size;
    const successRate = total > 0 ? accepted / total : 0;
    return { totalInterests: total, accepted, rejected, pending, successRate };
  } catch {
    return { totalInterests: 0, accepted: 0, rejected: 0, pending: 0, successRate: 0 };
  }
}

async function getMembershipByPlan(): Promise<Record<string, { count: number; revenue: number }>> {
  try {
    const snap = await getDocs(query(collection(db!, collections.payments), where("status", "==", "success"), limit(1000)));
    const byPlan: Record<string, { count: number; revenue: number }> = {};
    for (const doc of snap.docs) {
      const data = doc.data() as { plan?: string; amount?: number };
      const plan = data.plan ?? "unknown";
      if (!byPlan[plan]) byPlan[plan] = { count: 0, revenue: 0 };
      byPlan[plan].count++;
      byPlan[plan].revenue += data.amount ?? 0;
    }
    return byPlan;
  } catch {
    return {};
  }
}

async function getVendorsAnalytics(): Promise<DashboardAnalytics["vendors"]> {
  try {
    const snap = await getDocs(query(collection(db!, collections.vendors), limit(500)));
    let featured = 0, totalRating = 0;
    for (const doc of snap.docs) {
      const data = doc.data() as { featured?: boolean; rating?: number };
      if (data.featured) featured++;
      totalRating += data.rating ?? 0;
    }
    return {
      total: snap.size,
      featured,
      avgRating: snap.size > 0 ? totalRating / snap.size : 0,
      totalRevenue: 0,
    };
  } catch {
    return { total: 0, featured: 0, avgRating: 0, totalRevenue: 0 };
  }
}

function emptyAnalytics(): DashboardAnalytics {
  return {
    users: { total: 0, active: 0, newToday: 0, newThisWeek: 0, newThisMonth: 0 },
    profiles: { total: 0, approved: 0, pending: 0, rejected: 0, verified: 0, premium: 0 },
    revenue: { total: 0, thisMonth: 0, averagePerUser: 0, payments: 0 },
    matches: { totalInterests: 0, accepted: 0, rejected: 0, pending: 0, successRate: 0 },
    ocr: { totalImports: 0, successRate: 0, avgConfidence: 0, duplicateRate: 0, avgProcessingTime: 0 },
    membership: { byPlan: {} },
    vendors: { total: 0, featured: 0, avgRating: 0, totalRevenue: 0 },
    telegram: { totalImports: 0, pending: 0, approved: 0, duplicates: 0 },
  };
}
