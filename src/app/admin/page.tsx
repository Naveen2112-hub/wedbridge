"use client";
import { useEffect, useState } from "react";
import { Users, CircleUser as UserCircle, Crown, Gem, BadgeCheck, Store, CalendarPlus, Heart, IndianRupee, TrendingUp, Eye, Sparkles, Send } from "lucide-react";
import { getAnalytics, type AdminAnalytics } from "@/lib/admin/analyticsService";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAnalytics().then((d) => { setData(d); setLoading(false); }); }, []);

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}</div>;
  if (!data) return null;

  const cards = [
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Male Profiles", value: data.maleProfiles, icon: UserCircle, color: "text-cyan-600 bg-cyan-50" },
    { label: "Female Profiles", value: data.femaleProfiles, icon: UserCircle, color: "text-pink-600 bg-pink-50" },
    { label: "Premium Members", value: data.premiumMembers, icon: Crown, color: "text-secondary-600 bg-secondary-50" },
    { label: "Gold Members", value: data.goldMembers, icon: Gem, color: "text-amber-600 bg-amber-50" },
    { label: "Verified Profiles", value: data.verifiedProfiles, icon: BadgeCheck, color: "text-green-600 bg-green-50" },
    { label: "Wedding Vendors", value: data.weddingVendors, icon: Store, color: "text-primary-600 bg-primary-50" },
    { label: "Today's Registrations", value: data.todayRegistrations, icon: CalendarPlus, color: "text-indigo-600 bg-indigo-50" },
    { label: "Today's Interests", value: data.todayInterests, icon: Heart, color: "text-rose-600 bg-rose-50" },
    { label: "Today's Revenue", value: `₹${data.todayRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-green-600 bg-green-50" },
    { label: "Monthly Revenue", value: `₹${data.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Dashboard Overview</h1><p className="text-lead mt-1 text-sm">Real-time platform metrics and insights.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => <Card key={c.label} {...c} />)}
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100">
          <h2 className="font-display text-lg font-semibold text-primary-900">Quick Analytics</h2>
          <div className="mt-4 space-y-3">
            <MiniStat icon={Users} label="New Users" value={data.newUsers} />
            <MiniStat icon={Eye} label="Profile Views" value={data.profileViews} />
            <MiniStat icon={Sparkles} label="AI Match Count" value={data.aiMatchCount} />
            <MiniStat icon={Send} label="Interests Sent" value={data.interestsSent} />
            <MiniStat icon={Crown} label="Premium Sales" value={data.premiumSales} />
            <MiniStat icon={IndianRupee} label="Vendor Revenue" value={`₹${data.vendorRevenue.toLocaleString()}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100 transition hover:shadow-md"><span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color)}><Icon className="h-5 w-5" /></span><p className="mt-3 font-display text-2xl font-bold text-primary-900">{value}</p><p className="text-sm text-muted">{label}</p></div>;
}

function MiniStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-muted"><Icon className="h-4 w-4" />{label}</span><span className="font-semibold text-primary-900">{value}</span></div>;
}
