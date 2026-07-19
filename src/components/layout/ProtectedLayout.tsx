"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Heart, LayoutDashboard, User, Search, Sparkles, Star, HeartHandshake, Bell, Crown, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";
const navItems = [
  { href: "/dashboard", key: "nav.dashboard" as const, icon: LayoutDashboard }, { href: "/profile", key: "nav.profile" as const, icon: User },
  { href: "/search", key: "nav.search" as const, icon: Search }, { href: "/ai-matches", key: "nav.aiMatches" as const, icon: Sparkles },
  { href: "/favourites", key: "nav.favourites" as const, icon: Star }, { href: "/interests", key: "nav.interests" as const, icon: HeartHandshake },
  { href: "/notifications", key: "nav.notifications" as const, icon: Bell }, { href: "/membership", key: "nav.membership" as const, icon: Crown },
  { href: "/settings", key: "nav.settings" as const, icon: Settings },
];
export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const handleLogout = async () => { await logout(); router.push("/login"); };
  return (
    <div className="flex min-h-screen bg-grain">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-primary-100 bg-white/80 backdrop-blur-md lg:flex lg:flex-col"><SidebarContent pathname={pathname} t={t} onLogout={handleLogout} userName={user?.displayName ?? user?.email ?? ""} /></aside>
      {open && (<aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-primary-100 bg-white shadow-card lg:hidden"><SidebarContent pathname={pathname} t={t} onLogout={handleLogout} userName={user?.displayName ?? user?.email ?? ""} onClose={() => setOpen(false)} /></aside>)}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary-100 bg-background/90 px-4 backdrop-blur-md lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="rounded-full p-2 text-primary-900 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <Link href="/" className="flex items-center gap-2.5" aria-label="WedBridge home"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-soft"><Heart className="h-4 w-4" fill="currentColor" /></span><span className="font-display text-lg font-semibold text-primary-900">Wed<span className="text-secondary-600">Bridge</span></span></Link>
          <button type="button" onClick={handleLogout} className="btn-ghost px-3 py-2 text-sm"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">{t("nav.logout")}</span></button>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
function SidebarContent({ pathname, t, onLogout, userName, onClose }: { pathname: string; t: (k: never) => string; onLogout: () => void; userName: string; onClose?: () => void; }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-5 py-5"><Link href="/" className="flex items-center gap-2.5" onClick={onClose}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-soft"><Heart className="h-4 w-4" fill="currentColor" /></span><span className="font-display text-lg font-semibold text-primary-900">Wed<span className="text-secondary-600">Bridge</span></span></Link>{onClose && <button type="button" onClick={onClose} className="rounded-full p-1.5 text-primary-900" aria-label="Close menu"><X className="h-5 w-5" /></button>}</div>
      <div className="px-3 py-2"><p className="truncate px-2 text-xs text-muted">{userName}</p></div>
      <nav className="flex-1 space-y-1 px-3 py-2">{navItems.map((item) => { const active = pathname === item.href || pathname.startsWith(item.href + "/"); return (<Link key={item.href} href={item.href} onClick={onClose} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-primary-50 text-primary-900" : "text-ink/70 hover:bg-primary-50/60 hover:text-primary-900")}><item.icon className="h-4 w-4" />{t(item.key as never)}</Link>); })}</nav>
      <div className="border-t border-primary-100 p-3"><button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-accent-50 hover:text-accent-700"><LogOut className="h-4 w-4" />{t("nav.logout" as never)}</button></div>
    </div>
  );
}
