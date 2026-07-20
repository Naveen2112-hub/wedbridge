"use client";
import { useEffect, useState } from "react";
import { Users, Eye, Sparkles, Send, Crown, Store, IndianRupee } from "lucide-react";
import { getAnalytics, type AdminAnalytics } from "@/lib/admin/analyticsService";
import { cn } from "@/lib/cn";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAnalytics().then((d) => { setData(d); setLoading(false); }); }, []);

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}</div>;
  if (!data) return null;

  const cards = [
    { label: "New Users", value: data.newUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Profile Views", value: data.profileViews, icon: Eye, color: "text-cyan-600 bg-cyan-50" },
    { label: "AI Match Count", value: data.aiMatchCount, icon: Sparkles, color: "text-secondary-600 bg-secondary-50" },
    { label: "Interests Sent", value: data.interestsSent, icon: Send, color: "text-rose-600 bg-rose-50" },
    { label: "Premium Sales", value: data.premiumSales, icon: Crown, color: "text-amber-600 bg-amber-50" },
    { label: "Vendor Revenue", value: `₹${data.vendorRevenue.toLocaleString()}`, icon: Store, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Analytics</h1><p className="text-lead mt-1 text-sm">Platform engagement and revenue analytics.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100 transition hover:shadow-md">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", c.color)}><c.icon className="h-5 w-5" /></span>
            <p className="mt-3 font-display text-2xl font-bold text-primary-900">{c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
