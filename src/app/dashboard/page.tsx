"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Store, Sparkles, Bell, Crown, Heart, ArrowRight, MessageCircle, Eye, Users, CircleCheck as CheckCircle, TrendingUp, Settings, Loader as Loader2, Star } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getActiveSubscription, getEffectiveTier, daysUntilExpiry } from "@/lib/membership/membershipService";
import { getUserNotifications } from "@/lib/notifications/notificationService";
import type { SubscriptionDocument, NotificationDocument } from "@/firebase/schema";

export default function DashboardPage() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<SubscriptionDocument | null>(null);
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [s, n] = await Promise.all([getActiveSubscription(user.uid), getUserNotifications(user.uid, 5)]);
      setSub(s); setNotifications(n); setDashLoading(false);
    })();
  }, [user]);

  if (loading || dashLoading) return <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8"><div className="flex items-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-rose-600" /><p className="text-neutral-500">Loading dashboard...</p></div></div>;

  const tier = getEffectiveTier(sub);
  const daysLeft = daysUntilExpiry(sub);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const profileComplete = appUser?.profileCompleted ?? false;

  const cards = [
    { href: "/search", icon: Search, title: "Find Matches", desc: "Browse verified profiles", color: "bg-rose-50 text-rose-600" },
    { href: "/ai-matches", icon: Sparkles, title: "AI Matches", desc: "Smart compatibility scores", color: "bg-violet-50 text-violet-600" },
    { href: "/profile", icon: User, title: "My Profile", desc: profileComplete ? "Profile complete" : "Complete your profile", color: "bg-blue-50 text-blue-600" },
    { href: "/messages", icon: MessageCircle, title: "Messages", desc: "Chat with your connections", color: "bg-cyan-50 text-cyan-600" },
    { href: "/notifications", icon: Bell, title: "Notifications", desc: `${unreadCount} unread`, color: "bg-amber-50 text-amber-600" },
    { href: "/membership", icon: Crown, title: "Membership", desc: tier === "free" ? "Upgrade to premium" : `${tier} · ${daysLeft}d left`, color: "bg-purple-50 text-purple-600" },
    { href: "/interests", icon: Heart, title: "Interests", desc: "Manage sent & received", color: "bg-pink-50 text-pink-600" },
    { href: "/favourites", icon: Star, title: "Favorites", desc: "Your shortlisted profiles", color: "bg-green-50 text-green-600" },
    { href: "/services", icon: Store, title: "Wedding Services", desc: "Book trusted vendors", color: "bg-indigo-50 text-indigo-600" },
    { href: "/my-bookings", icon: CheckCircle, title: "My Bookings", desc: "Vendor booking history", color: "bg-teal-50 text-teal-600" },
    { href: "/settings", icon: Settings, title: "Settings", desc: "Account preferences", color: "bg-gray-50 text-gray-600" },
    { href: "/wedding-planner", icon: TrendingUp, title: "Wedding Planner", desc: "Plan your dream wedding", color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-rose-600" fill="currentColor" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome, {appUser?.name || appUser?.email || "User"}!</h1>
          <p className="mt-1 text-sm text-neutral-500">Your journey to finding the perfect match starts here.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" /><span className="text-sm font-medium text-neutral-500">Membership</span></div><p className="mt-2 text-lg font-bold capitalize text-neutral-900">{tier}</p>{daysLeft > 0 && <p className="text-xs text-neutral-400">{daysLeft} days remaining</p>}</div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-sm font-medium text-neutral-500">Profile</span></div><p className="mt-2 text-lg font-bold text-neutral-900">{profileComplete ? "Complete" : "Incomplete"}</p>{!profileComplete && <Link href="/complete-profile" className="text-xs text-rose-600 hover:underline">Complete now</Link>}</div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex items-center gap-2"><Bell className="h-5 w-5 text-blue-500" /><span className="text-sm font-medium text-neutral-500">Notifications</span></div><p className="mt-2 text-lg font-bold text-neutral-900">{unreadCount} unread</p><Link href="/notifications" className="text-xs text-rose-600 hover:underline">View all</Link></div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-500" /><span className="text-sm font-medium text-neutral-500">AI Matches</span></div><p className="mt-2 text-lg font-bold text-neutral-900">Smart</p><Link href="/ai-matches" className="text-xs text-rose-600 hover:underline">View matches</Link></div>
      </div>

      {notifications.length > 0 && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Recent Activity</h2>
          <div className="mt-3 space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-3 border-b border-neutral-50 pb-2"><Bell className="mt-0.5 h-4 w-4 flex-none text-neutral-400" /><div><p className="text-sm font-medium text-neutral-900">{n.title}</p><p className="text-xs text-neutral-500">{n.message}</p></div></div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}><c.icon className="h-6 w-6" /></span>
              <ArrowRight className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-rose-600" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-neutral-900">{c.title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
