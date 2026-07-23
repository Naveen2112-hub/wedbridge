"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  Search,
  Sparkles,
  Store,
  Crown,
  Info,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { subscribeNotifications } from "@/lib/notifications/notificationService";
import type { NotificationDocument } from "@/firebase/schema";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/matches", label: "Matches" },
  { href: "/services", label: "Marketplace" },
  { href: "/membership", label: "Membership" },
  { href: "/ai-matches", label: "AI Match" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, appUser, logout, loading } = useAuth();
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.uid, (items) => setNotifications(items));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAdmin = appUser?.role === "admin";
  const isVendor = appUser?.role === "vendor";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors",
        scrolled
          ? "border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90"
          : "border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-600" fill="currentColor" />
          <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            WedBridge
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/" && (pathname ?? "").startsWith(l.href + "/"));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "text-rose-600"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-white px-1 py-0.5 dark:border-neutral-700 dark:bg-neutral-800 sm:flex">
            <Globe className="ml-1.5 h-3.5 w-3.5 text-neutral-500" />
            <button
              onClick={() => setLang("en")}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium transition",
                lang === "en" ? "bg-rose-600 text-white" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ta")}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium transition",
                lang === "ta" ? "bg-rose-600 text-white" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
              )}
            >
              த
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {user && !loading && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-700">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-neutral-500">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            "border-b border-neutral-50 px-4 py-3 dark:border-neutral-700/50",
                            !n.read && "bg-rose-50/50 dark:bg-rose-900/10",
                          )}
                        >
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{n.title}</p>
                          <p className="mt-0.5 text-xs text-neutral-500">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href="/notifications"
                    className="block border-t border-neutral-100 px-4 py-3 text-center text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-neutral-700"
                  >
                    View all
                  </Link>
                </div>
              )}
            </div>
          )}

          {user && !loading ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 rounded-lg p-1 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {appUser?.photoURL ? (
                  <img src={appUser.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-white">
                    {(appUser?.name || appUser?.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-700">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                      {appUser?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{appUser?.email || user.email}</p>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700">
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  {isVendor && (
                    <Link href="/vendor-dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700">
                      <Store className="h-4 w-4" /> Vendor Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700">
                      <LayoutDashboard className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700">
                    <Crown className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    onClick={() => { logout(); router.push("/"); }}
                    className="flex w-full items-center gap-2 border-t border-neutral-100 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:border-neutral-700"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                Register Free
              </Link>
            </div>
          )}

          <button
            className="lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6 text-neutral-700" /> : <Menu className="h-6 w-6 text-neutral-700" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setLang("en")}
                className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", lang === "en" ? "bg-rose-600 text-white" : "text-neutral-500")}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ta")}
                className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", lang === "ta" ? "bg-rose-600 text-white" : "text-neutral-500")}
              >
                த
              </button>
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-neutral-600 dark:text-neutral-300"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            </div>
            {!user && (
              <div className="mt-2 flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-700 dark:border-neutral-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
