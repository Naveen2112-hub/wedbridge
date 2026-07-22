import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";
import { logger } from "@/lib/monitoring/logger";

export interface AdminAnalytics {
  totalUsers: number; maleProfiles: number; femaleProfiles: number; premiumMembers: number; goldMembers: number; verifiedProfiles: number; weddingVendors: number; todayRegistrations: number; todayInterests: number; todayRevenue: number; monthlyRevenue: number; newUsers: number; profileViews: number; aiMatchCount: number; interestsSent: number; premiumSales: number; vendorRevenue: number;
}

const empty: AdminAnalytics = { totalUsers: 0, maleProfiles: 0, femaleProfiles: 0, premiumMembers: 0, goldMembers: 0, verifiedProfiles: 0, weddingVendors: 0, todayRegistrations: 0, todayInterests: 0, todayRevenue: 0, monthlyRevenue: 0, newUsers: 0, profileViews: 0, aiMatchCount: 0, interestsSent: 0, premiumSales: 0, vendorRevenue: 0 };

export async function getAnalytics(): Promise<AdminAnalytics> {
  if (!db) return empty;
  const database = db;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  try {
    const [usersSnap, maleSnap, femaleSnap, premiumSnap, goldSnap, verifiedSnap, vendorsSnap, todayPaymentsSnap, monthPaymentsSnap, interestsSnap, todayInterestsSnap] = await Promise.all([
      getDocs(query(collection(database, collections.users), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.profiles), where("gender", "==", "male"), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.profiles), where("gender", "==", "female"), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.users), where("membershipTier", "==", "premium"), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.users), where("membershipTier", "==", "gold"), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.profiles), where("verified", "==", true), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.vendors), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.payments), where("status", "in", ["verified", "paid"]), where("createdAt", ">=", todayStart), orderBy("createdAt", "desc"), limit(500))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.payments), where("status", "in", ["verified", "paid"]), where("createdAt", ">=", monthStart), orderBy("createdAt", "desc"), limit(500))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.interests), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.interests), where("createdAt", ">=", todayStart), orderBy("createdAt", "desc"), limit(500))).catch(() => ({ docs: [] })),
    ]);

    const todayRevenue = (todayPaymentsSnap as { docs: { data: () => Record<string, unknown> }[] }).docs.reduce((s, d) => s + Number(d.data().amount ?? 0), 0);
    const monthlyRevenue = (monthPaymentsSnap as { docs: { data: () => Record<string, unknown> }[] }).docs.reduce((s, d) => s + Number(d.data().amount ?? 0), 0);
    const allPayments = (monthPaymentsSnap as { docs: { data: () => Record<string, unknown> }[] }).docs;

    const ts = (v: unknown) => (v as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
    const isToday = (v: unknown) => ts(v) >= todayStart.getTime();
    const users = usersSnap.docs.map((d) => d.data() as Record<string, unknown>);

    return {
      totalUsers: usersSnap.docs.length,
      maleProfiles: maleSnap.docs.length,
      femaleProfiles: femaleSnap.docs.length,
      premiumMembers: premiumSnap.docs.length,
      goldMembers: goldSnap.docs.length,
      verifiedProfiles: verifiedSnap.docs.length,
      weddingVendors: vendorsSnap.docs.length,
      todayRegistrations: users.filter((u) => isToday(u.createdAt)).length,
      todayInterests: todayInterestsSnap.docs.length,
      todayRevenue,
      monthlyRevenue,
      newUsers: usersSnap.docs.length,
      profileViews: 0,
      aiMatchCount: 0,
      interestsSent: interestsSnap.docs.length,
      premiumSales: allPayments.length,
      vendorRevenue: 0,
    };
  } catch (e) {
    logger.error("Analytics fetch failed", { error: e instanceof Error ? e.message : String(e) });
    return empty;
  }
}

export interface ReportRow { date: string; users: number; revenue: number; interests: number; }
export async function getReport(period: "daily" | "weekly" | "monthly" | "yearly"): Promise<ReportRow[]> {
  if (!db) return [];
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.payments), orderBy("createdAt", "desc"), limit(500)));
    const payments = snap.docs.map((d) => d.data() as Record<string, unknown>);
    const groups = new Map<string, ReportRow>();
    const fmt = period === "yearly" ? { year: "numeric" } as const : period === "monthly" ? { month: "short", year: "numeric" } as const : { month: "short", day: "numeric" } as const;
    for (const p of payments) { const t = (p.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.(); if (!t) continue; const key = new Date(t).toLocaleDateString("en-US", fmt); const row = groups.get(key) ?? { date: key, users: 0, revenue: 0, interests: 0 }; row.revenue += Number(p.amount ?? 0); groups.set(key, row); }
    return Array.from(groups.values());
  } catch { return []; }
}

export interface AnalyticsTrend {
  label: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export async function getAnalyticsTrends(): Promise<{ users: AnalyticsTrend; revenue: AnalyticsTrend; interests: AnalyticsTrend }> {
  if (!db) return { users: { label: "Users", current: 0, previous: 0, change: 0, changePercent: 0 }, revenue: { label: "Revenue", current: 0, previous: 0, change: 0, changePercent: 0 }, interests: { label: "Interests", current: 0, previous: 0, change: 0, changePercent: 0 } };
  const database = db;
  const now = new Date();
  const thisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
  try {
    const [thisWeekPayments, lastWeekPayments, thisWeekInterests, lastWeekInterests] = await Promise.all([
      getDocs(query(collection(database, collections.payments), where("createdAt", ">=", thisWeek), limit(500))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.payments), where("createdAt", ">=", lastWeek), limit(500))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.interests), where("createdAt", ">=", thisWeek), limit(500))).catch(() => ({ docs: [] })),
      getDocs(query(collection(database, collections.interests), where("createdAt", ">=", lastWeek), limit(500))).catch(() => ({ docs: [] })),
    ]);
    const thisWeekRev = (thisWeekPayments as { docs: { data: () => Record<string, unknown> }[] }).docs.reduce((s, d) => s + Number(d.data().amount ?? 0), 0);
    const lastWeekRev = (lastWeekPayments as { docs: { data: () => Record<string, unknown> }[] }).docs.reduce((s, d) => s + Number(d.data().amount ?? 0), 0);
    const thisWeekInt = thisWeekInterests.docs.length;
    const lastWeekInt = lastWeekInterests.docs.length;
    const calcChange = (curr: number, prev: number) => ({ change: curr - prev, changePercent: prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0 });
    return {
      users: { label: "New Users", current: 0, previous: 0, ...calcChange(0, 0) },
      revenue: { label: "Revenue", current: thisWeekRev, previous: lastWeekRev, ...calcChange(thisWeekRev, lastWeekRev) },
      interests: { label: "Interests", current: thisWeekInt, previous: lastWeekInt, ...calcChange(thisWeekInt, lastWeekInt) },
    };
  } catch {
    return { users: { label: "Users", current: 0, previous: 0, change: 0, changePercent: 0 }, revenue: { label: "Revenue", current: 0, previous: 0, change: 0, changePercent: 0 }, interests: { label: "Interests", current: 0, previous: 0, change: 0, changePercent: 0 } };
  }
}
