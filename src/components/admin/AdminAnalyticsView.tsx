"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Users, FileText, CreditCard, Store, Calendar, IndianRupee, BadgeCheck } from "lucide-react";
import { getAnalytics, type AdminAnalytics } from "@/lib/admin/analyticsService";
import { formatCurrency } from "@/lib/utils";

export function AdminAnalyticsView() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAnalytics().then((d) => { setData(d); setLoading(false); }); }, []);

  if (loading || !data) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}</div>;

  const metrics = [
    { icon: Users, label: "Total Users", value: String(data.totalUsers) },
    { icon: FileText, label: "Male Profiles", value: String(data.maleProfiles) },
    { icon: FileText, label: "Female Profiles", value: String(data.femaleProfiles) },
    { icon: BadgeCheck, label: "Verified Profiles", value: String(data.verifiedProfiles) },
    { icon: TrendingUp, label: "Verification Rate", value: `${data.totalUsers > 0 ? ((data.verifiedProfiles / data.totalUsers) * 100).toFixed(1) : 0}%` },
    { icon: Store, label: "Wedding Vendors", value: String(data.weddingVendors) },
    { icon: IndianRupee, label: "Monthly Revenue", value: formatCurrency(data.monthlyRevenue) },
    { icon: CreditCard, label: "Interests Sent", value: String(data.interestsSent) },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Analytics</h1><p className="text-lead mt-1 text-sm">Deep-dive platform analytics</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => <div key={m.label} className="card p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><m.icon className="h-5 w-5" /></span><p className="mt-3 font-display text-2xl font-bold text-primary-900">{m.value}</p><p className="text-sm text-muted">{m.label}</p></div>)}
      </div>
    </div>
  );
}
