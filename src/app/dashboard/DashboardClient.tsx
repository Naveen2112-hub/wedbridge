"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, Sparkles, HeartHandshake, Bell, Crown, Search, ArrowRight, CircleAlert as AlertCircle, Eye, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CompletionCard } from "@/components/profile/CompletionCard";
import { MembershipCard } from "@/components/membership/MembershipCard";
import { getProfile, calculateCompletion } from "@/lib/profile/profileService";
import { cn } from "@/lib/cn";
import type { ProfileDocument } from "@/firebase/schema";

const aiMatches = [{ name: "Priya R.", age: 27, location: "Chennai", score: 96, image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg" }, { name: "Divya M.", age: 25, location: "Coimbatore", score: 92, image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" }, { name: "Meena K.", age: 28, location: "Madurai", score: 89, image: "https://images.pexels.com/photos/1456626/pexels-photo-1456626.jpeg" }];
const recentInterests = [{ name: "Karthik S.", time: "2h ago", status: "pending" as const }, { name: "Arjun V.", time: "1d ago", status: "accepted" as const }, { name: "Vignesh R.", time: "3d ago", status: "pending" as const }];
const notifications = [{ text: "New AI match found for you", time: "10m ago" }, { text: "Karthik accepted your interest", time: "1h ago" }, { text: "Complete your profile for better matches", time: "1d ago" }];
const recentlyViewed = [{ name: "Ananya S.", age: 26, location: "Chennai", image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg" }, { name: "Lakshmi P.", age: 24, location: "Salem", image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" }];

export default function DashboardPage() { return (<AuthGuard><ProtectedLayout><DashboardContent /></ProtectedLayout></AuthGuard>); }
function DashboardContent() {
  const { user, profileCompleted } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Partial<ProfileDocument> | null>(null);
  useEffect(() => { (async () => { if (user) setProfile(await getProfile(user.uid)); })(); }, [user]);
  const completion = profile ? calculateCompletion(profile).percentage : (profileCompleted ? 100 : 40);
  const name = user?.displayName ?? (user?.email ? user.email.split("@")[0] : "");
  const viewAll = t("dashboard.viewAll");
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-md sm:p-8"><div className="absolute inset-0 bg-hero-texture opacity-30" /><div className="relative flex flex-wrap items-center justify-between gap-6"><div><p className="text-sm text-white/70">{t("dashboard.welcome")}</p><h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{name || "Member"}</h1><p className="mt-2 text-sm text-white/80">{t("dashboard.profileCompletion")}: {completion}%</p><div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-secondary-500 transition-all" style={{ width: `${completion}%` }} /></div></div><span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15"><Heart className="h-10 w-10 text-secondary-400" fill="currentColor" /></span></div></div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-md"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800"><TrendingUp className="h-5 w-5" /></span><h2 className="font-display text-lg font-semibold text-primary-900">{t("dashboard.profileCompletion")}</h2></div><p className="mt-3 font-display text-3xl font-semibold text-primary-900">{completion}%</p><div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary-50"><div className={cn("h-full rounded-full", completion >= 50 ? "bg-green-500" : "bg-secondary-500")} style={{ width: `${completion}%` }} /></div>{completion < 50 && <Link href="/profile/edit" className="btn-outline mt-4 w-full text-sm">{t("dashboard.completeNow")}</Link>}</div>
            <div className="rounded-2xl bg-white p-6 shadow-md"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-800"><Crown className="h-5 w-5" /></span><h2 className="font-display text-lg font-semibold text-primary-900">{t("dashboard.membershipBanner")}</h2></div><p className="mt-3 text-sm text-gray-500">{t("dashboard.premiumBannerDesc")}</p><Link href="/membership" className="btn-secondary mt-4 w-full text-sm">{t("dashboard.upgrade")}<ArrowRight className="h-4 w-4" /></Link></div>
          </div>

          {!profileCompleted && <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-200 bg-accent-50 p-5"><p className="flex items-center gap-2 text-sm text-accent-800"><AlertCircle className="h-4 w-4" />{t("dashboard.completeProfile")}</p><Link href="/complete-profile" className="btn-accent">{t("dashboard.completeNow")}</Link></div>}

          <Card title={t("dashboard.aiSuggestions")} icon={Sparkles} viewAllHref="/ai-matches" viewAllLabel={viewAll}><div className="grid gap-3 sm:grid-cols-3">{aiMatches.map((m) => (<div key={m.name} className="overflow-hidden rounded-xl border border-primary-50 transition hover:border-secondary-500 hover:bg-secondary-50/40"><div className="relative aspect-square"><Image src={m.image} alt={m.name} fill sizes="33vw" className="object-cover" /></div><div className="p-3"><p className="truncate text-sm font-semibold text-primary-900">{m.name}</p><p className="text-xs text-gray-500">{m.age} · {m.location}</p><span className="badge-secondary mt-2">{m.score}%</span></div></div>))}</div></Card>

          <Card title={t("dashboard.recentlyViewed")} icon={Eye} viewAllHref="/search" viewAllLabel={viewAll}><div className="grid gap-3 sm:grid-cols-2">{recentlyViewed.map((m) => (<div key={m.name} className="flex items-center gap-3 rounded-xl border border-primary-50 p-3"><div className="relative h-12 w-12 flex-none overflow-hidden rounded-full"><Image src={m.image} alt={m.name} fill sizes="48px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-primary-900">{m.name}</p><p className="text-xs text-gray-500">{m.age} · {m.location}</p></div></div>))}</div></Card>

          <Card title={t("dashboard.recentInterests")} icon={HeartHandshake} viewAllHref="/interests" viewAllLabel={viewAll}><div className="space-y-3">{recentInterests.map((i) => (<div key={i.name} className="flex items-center justify-between gap-3 rounded-xl border border-primary-50 p-3"><div><p className="text-sm font-semibold text-primary-900">{i.name}</p><p className="text-xs text-gray-500">{i.time}</p></div><span className={cn("badge", i.status === "accepted" ? "bg-green-50 text-green-700" : "bg-primary-50 text-primary-800")}>{i.status}</span></div>))}</div></Card>
        </div>

        <div className="space-y-6">
          {profile && <CompletionCard profile={profile} />}
          <MembershipCard />
          <Card title={t("dashboard.notifications")} icon={Bell} viewAllHref="/notifications" viewAllLabel={viewAll}><div className="space-y-3">{notifications.map((n, i) => (<div key={i} className="flex items-start gap-3 rounded-xl border border-primary-50 p-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-secondary-500" /><div><p className="text-sm text-gray-900/80">{n.text}</p><p className="text-xs text-gray-500">{n.time}</p></div></div>))}</div></Card>
          <div className="rounded-2xl bg-white p-6 shadow-md"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800"><Search className="h-5 w-5" /></span><h2 className="font-display text-lg font-semibold text-primary-900">{t("dashboard.quickSearch")}</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><select className="input"><option>Any religion</option><option>Hindu</option><option>Christian</option><option>Muslim</option></select><select className="input"><option>Any age</option><option>21-25</option><option>26-30</option><option>31-35</option></select><select className="input"><option>Any district</option><option>Chennai</option><option>Coimbatore</option><option>Madurai</option></select><Link href="/search" className="btn-primary">{t("nav.search")}</Link></div></div>
        </div>
      </div>
    </div>
  );
}
function Card({ title, icon: Icon, viewAllHref, viewAllLabel, children }: { title: string; icon: React.ComponentType<{ className?: string }>; viewAllHref: string; viewAllLabel: string; children: React.ReactNode }) { return (<div className="rounded-2xl bg-white p-6 shadow-md"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800"><Icon className="h-5 w-5" /></span><h2 className="font-display text-lg font-semibold text-primary-900">{title}</h2></div><Link href={viewAllHref} className="text-xs font-semibold text-secondary-700 hover:text-secondary-900">{viewAllLabel}</Link></div>{children}</div>); }
