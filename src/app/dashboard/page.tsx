"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, HeartHandshake, Bell, Crown, Search, ArrowRight, CircleAlert as AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { cn } from "@/lib/cn";
const aiMatches = [{ name: "Priya R.", age: 27, location: "Chennai", score: 96, image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg" }, { name: "Divya M.", age: 25, location: "Coimbatore", score: 92, image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" }, { name: "Meena K.", age: 28, location: "Madurai", score: 89, image: "https://images.pexels.com/photos/1456626/pexels-photo-1456626.jpeg" }];
const recentInterests = [{ name: "Karthik S.", time: "2h ago", status: "pending" as const }, { name: "Arjun V.", time: "1d ago", status: "accepted" as const }, { name: "Vignesh R.", time: "3d ago", status: "pending" as const }];
const notifications = [{ text: "New AI match found for you", time: "10m ago" }, { text: "Karthik accepted your interest", time: "1h ago" }, { text: "Complete your profile for better matches", time: "1d ago" }];

export default function DashboardPage() { return (<AuthGuard><ProtectedLayout><DashboardContent /></ProtectedLayout></AuthGuard>); }
function DashboardContent() {
  const { user, profileCompleted } = useAuth();
  const { t } = useLanguage();
  const completion = profileCompleted ? 100 : 40;
  const name = user?.displayName ?? (user?.email ? user.email.split("@")[0] : "");
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-card sm:p-8"><div className="absolute inset-0 bg-hero-pattern opacity-30" /><div className="relative flex flex-wrap items-center justify-between gap-6"><div><p className="text-sm text-white/70">{t("dashboard.welcome")}</p><h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{name || "Member"}</h1><p className="mt-2 text-sm text-white/80">{t("dashboard.profileCompletion")}: {completion}%</p><div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${completion}%` }} /></div></div><span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15"><Heart className="h-10 w-10 text-secondary" fill="currentColor" /></span></div></div>
      <div className="relative overflow-hidden rounded-2xl border border-secondary/40 bg-gradient-to-r from-secondary-50 to-primary-50/40 p-6 shadow-soft sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-start gap-4"><span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-secondary-100 text-secondary-800"><Crown className="h-6 w-6" /></span><div><h2 className="font-display text-lg font-semibold text-primary-900">{t("dashboard.premiumBanner")}</h2><p className="mt-1 text-sm text-muted">{t("dashboard.premiumBannerDesc")}</p></div></div><Link href="/membership" className="btn-secondary">{t("dashboard.upgrade")}<ArrowRight className="h-4 w-4" /></Link></div></div>
      {!profileCompleted && <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-200 bg-accent-50 p-5"><p className="flex items-center gap-2 text-sm text-accent-800"><AlertCircle className="h-4 w-4" />{t("dashboard.completeProfile")}</p><Link href="/complete-profile" className="btn-accent">{t("dashboard.completeNow")}</Link></div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={t("dashboard.aiMatches")} icon={Sparkles} viewAllHref="/ai-matches"><div className="space-y-3">{aiMatches.map((m) => (<div key={m.name} className="flex items-center gap-3 rounded-xl border border-primary-50 p-3 transition hover:border-secondary hover:bg-secondary-50/40"><div className="relative h-12 w-12 flex-none overflow-hidden rounded-full"><Image src={m.image} alt={m.name} fill sizes="48px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-primary-900">{m.name}</p><p className="text-xs text-muted">{m.age} yrs · {m.location}</p></div><span className="badge-secondary flex-none">{m.score}%</span></div>))}</div></Card>
        <Card title={t("dashboard.recentInterests")} icon={HeartHandshake} viewAllHref="/interests"><div className="space-y-3">{recentInterests.map((i) => (<div key={i.name} className="flex items-center justify-between gap-3 rounded-xl border border-primary-50 p-3"><div><p className="text-sm font-semibold text-primary-900">{i.name}</p><p className="text-xs text-muted">{i.time}</p></div><span className={cn("badge", i.status === "accepted" ? "bg-green-50 text-green-700" : "bg-primary-50 text-primary-800")}>{i.status}</span></div>))}</div></Card>
        <Card title={t("dashboard.notifications")} icon={Bell} viewAllHref="/notifications"><div className="space-y-3">{notifications.map((n, i) => (<div key={i} className="flex items-start gap-3 rounded-xl border border-primary-50 p-3"><span className="mt-1 h-2 w-2 flex-none rounded-full bg-secondary" /><div><p className="text-sm text-ink/80">{n.text}</p><p className="text-xs text-muted">{n.time}</p></div></div>))}</div></Card>
      </div>
      <div className="rounded-2xl bg-card p-6 shadow-card"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800"><Search className="h-5 w-5" /></span><h2 className="font-display text-lg font-semibold text-primary-900">{t("dashboard.quickSearch")}</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-4"><select className="input"><option>Any religion</option><option>Hindu</option><option>Christian</option><option>Muslim</option></select><select className="input"><option>Any age</option><option>21-25</option><option>26-30</option><option>31-35</option></select><select className="input"><option>Any district</option><option>Chennai</option><option>Coimbatore</option><option>Madurai</option></select><Link href="/search" className="btn-primary">{t("nav.search")}</Link></div></div>
    </div>
  );
}
function Card({ title, icon: Icon, viewAllHref, children }: { title: string; icon: React.ComponentType<{ className?: string }>; viewAllHref: string; children: React.ReactNode }) {
  const { t } = useLanguage();
  return (<div className="rounded-2xl bg-card p-6 shadow-card"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800"><Icon className="h-5 w-5" /></span><h2 className="font-display text-lg font-semibold text-primary-900">{title}</h2></div><Link href={viewAllHref} className="text-xs font-semibold text-secondary-700 hover:text-secondary-900">{t("dashboard.viewAll")}</Link></div>{children}</div>);
}
