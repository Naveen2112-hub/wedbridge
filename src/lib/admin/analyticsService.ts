import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";

export interface AdminAnalytics {
  totalUsers: number; maleProfiles: number; femaleProfiles: number;
  premiumMembers: number; goldMembers: number; verifiedProfiles: number;
  weddingVendors: number; todayRegistrations: number; todayInterests: number;
  todayRevenue: number; monthlyRevenue: number;
  newUsers: number; profileViews: number; aiMatchCount: number;
  interestsSent: number; premiumSales: number; vendorRevenue: number;
}

export async function getAnalytics(): Promise<AdminAnalytics> {
  const empty: AdminAnalytics = { totalUsers: 0, maleProfiles: 0, femaleProfiles: 0, premiumMembers: 0, goldMembers: 0, verifiedProfiles: 0, weddingVendors: 0, todayRegistrations: 0, todayInterests: 0, todayRevenue: 0, monthlyRevenue: 0, newUsers: 0, profileViews: 0, aiMatchCount: 0, interestsSent: 0, premiumSales: 0, vendorRevenue: 0 };
  if (!db) return empty;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  try {
    const [usersSnap, profilesSnap, vendorsSnap, paymentsSnap, interestsSnap] = await Promise.all([
      getDocs(query(collection(db, collections.users), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, collections.profiles), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, collections.vendors), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, collections.payments), limit(1000))).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, collections.interests), limit(1000))).catch(() => ({ docs: [] })),
    ]);
    const users = usersSnap.docs.map((d) => d.data() as Record<string, unknown>);
    const profiles = profilesSnap.docs.map((d) => d.data() as Record<string, unknown>);
    const payments = paymentsSnap.docs.map((d) => d.data() as Record<string, unknown>);
    const interests = interestsSnap.docs.map((d) => d.data() as Record<string, unknown>);

    const ts = (v: unknown) => (v as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
    const isToday = (v: unknown) => ts(v) >= todayStart.getTime();
    const isThisMonth = (v: unknown) => ts(v) >= monthStart.getTime();

    return {
      totalUsers: users.length,
      maleProfiles: profiles.filter((p) => p.gender === "male").length,
      femaleProfiles: profiles.filter((p) => p.gender === "female").length,
      premiumMembers: users.filter((u) => u.membershipTier === "premium").length,
      goldMembers: users.filter((u) => u.membershipTier === "gold").length,
      verifiedProfiles: profiles.filter((p) => p.verified === true).length,
      weddingVendors: vendorsSnap.docs.length,
      todayRegistrations: users.filter((u) => isToday(u.createdAt)).length,
      todayInterests: interests.filter((i) => isToday(i.createdAt)).length,
      todayRevenue: payments.filter((p) => p.status === "verified" && isToday(p.createdAt)).reduce((s, p) => s + Number(p.amount ?? 0), 0),
      monthlyRevenue: payments.filter((p) => p.status === "verified" && isThisMonth(p.createdAt)).reduce((s, p) => s + Number(p.amount ?? 0), 0),
      newUsers: users.length, profileViews: 0, aiMatchCount: 0,
      interestsSent: interests.length,
      premiumSales: payments.filter((p) => p.status === "verified").length,
      vendorRevenue: 0,
    };
  } catch { return empty; }
}

export interface ReportRow { date: string; users: number; revenue: number; interests: number; }
export async function getReport(period: "daily" | "weekly" | "monthly" | "yearly"): Promise<ReportRow[]> {
  if (!db) return [];
  try {
    const { orderBy } = await import("firebase/firestore");
    const snap = await getDocs(query(collection(db, collections.payments), orderBy("createdAt", "desc"), limit(500)));
    const payments = snap.docs.map((d) => d.data() as Record<string, unknown>);
    const groups = new Map<string, ReportRow>();
    const fmt = period === "yearly" ? { year: "numeric" } as const : period === "monthly" ? { month: "short", year: "numeric" } as const : { month: "short", day: "numeric" } as const;
    for (const p of payments) {
      const t = (p.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.();
      if (!t) continue;
      const key = new Date(t).toLocaleDateString("en-US", fmt);
      const row = groups.get(key) ?? { date: key, users: 0, revenue: 0, interests: 0 };
      row.revenue += Number(p.amount ?? 0);
      groups.set(key, row);
    }
    return Array.from(groups.values());
  } catch { return []; }
}
