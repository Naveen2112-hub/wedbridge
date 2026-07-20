"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Heart, LayoutDashboard, User, Search, Sparkles, Star, HeartHandshake, Bell, Crown, Settings, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dashboard", key: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/profile", key: "nav.profile" as const, icon: User },
  { href: "/search", key: "nav.search" as const, icon: Search },
  { href: "/ai-matches", key: "nav.aiMatches" as const, icon: Sparkles },
  { href: "/favourites", key: "nav.favourites" as const, icon: Star },
  { href: "/interests", key: "nav.interests" as const, icon: HeartHandshake },
  { href: "/notifications", key: "nav.notifications" as const, icon: Bell },
  { href: "/membership", key: "nav.membership" as const, icon: Crown },
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
    <div className="flex min-h-screen bg-gradient-soft">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-primary-100/80 bg-white/90 backdrop-blur-xl lg:flex lg:flex-col">
        <SidebarContent pathname={pathname ?? ""} t={t} onLogout={handleLogout} userName={user?.displayName ?? user?.email ?? ""} />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-primary-950/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-y-0 left-0 z-50 w-64 border-r border-primary-100 bg-white shadow-elevated lg:hidden">
              <SidebarContent pathname={pathname ?? ""} t={t} onLogout={handleLogout} userName={user?.displayName ?? user?.email ?? ""} onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary-100/80 px-4 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink/70 transition-colors hover:bg-primary-50 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5" aria-label="WedBridge home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm shadow-soft">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
            </span>
            <span className="font-display text-lg font-bold text-primary-800">WedBridge</span>
          </Link>
          <button type="button" onClick={handleLogout} className="btn-ghost px-3 py-2 text-sm">
            <LogOut className="h-4 w-4" /><span className="hidden sm:inline">{t("nav.logout")}</span>
          </button>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, t, onLogout, userName, onClose }: { pathname: string; t: (k: never) => string; onLogout: () => void; userName: string; onClose?: () => void; }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm shadow-soft">
            <Heart className="h-4 w-4 text-white" fill="currentColor" />
          </span>
          <span className="font-display text-lg font-bold text-primary-800">WedBridge</span>
        </Link>
        {onClose && <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink/60 hover:bg-primary-50" aria-label="Close menu"><X className="h-5 w-5" /></button>}
      </div>
      <div className="px-5 py-2">
        <div className="flex items-center gap-3 rounded-xl bg-primary-50/60 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-warm text-sm font-semibold text-white">{userName[0]?.toUpperCase() ?? "U"}</div>
          <p className="truncate text-sm font-medium text-ink">{userName}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={onClose} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200", active ? "bg-primary-600 text-white shadow-soft" : "text-ink/70 hover:bg-primary-50 hover:text-primary-700")}>
              <item.icon className="h-4 w-4" />{t(item.key as never)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-primary-100 p-3">
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error-600 transition-colors hover:bg-error-50">
          <LogOut className="h-4 w-4" />{t("nav.logout" as never)}
        </button>
      </div>
    </div>
  );
}
