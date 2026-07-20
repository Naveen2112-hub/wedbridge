"use client";
import { useEffect, useState } from "react";
import { Users, FileText, CreditCard, Store, Calendar, TrendingUp, IndianRupee, BadgeCheck, Crown } from "lucide-react";
import { getAnalytics, type AdminAnalytics } from "@/lib/admin/analyticsService";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AdminDashboardView() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAnalytics().then((d) => { setData(d); setLoading(false); }); }, []);

  if (loading || !data) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}</div>;

  const stats = [
    { icon: Users, label: "Total Users", value: String(data.totalUsers), color: "text-blue-600 bg-blue-50" },
    { icon: FileText, label: "Male Profiles", value: String(data.maleProfiles), color: "text-purple-600 bg-purple-50" },
    { icon: FileText, label: "Female Profiles", value: String(data.femaleProfiles), color: "text-pink-600 bg-pink-50" },
    { icon: BadgeCheck, label: "Verified Profiles", value: String(data.verifiedProfiles), color: "text-green-600 bg-green-50" },
    { icon: Crown, label: "Premium Members", value: String(data.premiumMembers + data.goldMembers), color: "text-secondary-600 bg-secondary-50" },
    { icon: Store, label: "Wedding Vendors", value: String(data.weddingVendors), color: "text-indigo-600 bg-indigo-50" },
    { icon: IndianRupee, label: "Monthly Revenue", value: formatCurrency(data.monthlyRevenue), color: "text-green-600 bg-green-50" },
    { icon: TrendingUp, label: "Interests Sent", value: String(data.interestsSent), color: "text-cyan-600 bg-cyan-50" },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Dashboard</h1><p className="text-lead mt-1 text-sm">Overview of platform metrics</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <div key={s.label} className="card p-5"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}><s.icon className="h-5 w-5" /></span><p className="mt-3 font-display text-2xl font-bold text-primary-900">{s.value}</p><p className="text-sm text-muted">{s.label}</p></div>)}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6"><h2 className="heading-sm">Today&apos;s Activity</h2><div className="mt-3 space-y-2"><div className="flex items-center justify-between border-b border-primary-50 pb-2"><span className="text-sm text-muted">New Registrations</span><span className="font-semibold text-primary-900">{data.todayRegistrations}</span></div><div className="flex items-center justify-between border-b border-primary-50 pb-2"><span className="text-sm text-muted">Interests Sent Today</span><span className="font-semibold text-primary-900">{data.todayInterests}</span></div><div className="flex items-center justify-between border-b border-primary-50 pb-2"><span className="text-sm text-muted">Today&apos;s Revenue</span><span className="font-semibold text-primary-900">{formatCurrency(data.todayRevenue)}</span></div></div></div>
        <div className="card p-6"><h2 className="heading-sm">Revenue Overview</h2><div className="mt-3 space-y-2"><div className="flex items-center justify-between border-b border-primary-50 pb-2"><span className="text-sm text-muted">Monthly Revenue</span><span className="font-semibold text-primary-900">{formatCurrency(data.monthlyRevenue)}</span></div><div className="flex items-center justify-between border-b border-primary-50 pb-2"><span className="text-sm text-muted">Premium Sales</span><span className="font-semibold text-primary-900">{data.premiumSales}</span></div><div className="flex items-center justify-between border-b border-primary-50 pb-2"><span className="text-sm text-muted">Vendor Revenue</span><span className="font-semibold text-primary-900">{formatCurrency(data.vendorRevenue)}</span></div></div></div>
      </div>
    </div>
  );
}
