"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/cn";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

const publicNav = [
  { href: "/search", key: "nav.search" as const },
  { href: "/ai-matches", key: "nav.aiMatches" as const },
  { href: "/wedding-services", key: "nav.weddingServices" as const },
  { href: "/success-stories", key: "nav.successStories" as const },
  { href: "/membership", key: "nav.membership" as const },
  { href: "/about", key: "nav.about" as const },
  { href: "/contact", key: "nav.contact" as const },
];

export function Navbar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "bg-background/90 backdrop-blur-md shadow-soft" : "bg-transparent")}>
      <nav className="container-page flex h-16 items-center justify-between lg:h-20">
        <Link href="/" className="flex items-center gap-2.5" aria-label="WedBridge home">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-soft"><Heart className="h-5 w-5" fill="currentColor" /></span>
          <span className="font-display text-xl font-semibold text-primary-900">Wed<span className="text-secondary-600">Bridge</span></span>
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {publicNav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} className={cn("rounded-full px-3.5 py-2 text-sm font-medium transition", active ? "bg-primary-50 text-primary-900" : "text-ink/70 hover:text-primary-900")}>{t(item.key)}</Link>
              </li>
            );
          })}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost">{t("nav.dashboard")}</Link>
              <button type="button" onClick={logout} className="btn-outline">{t("nav.logout")}</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">{t("nav.login")}</Link>
              <Link href="/register" className="btn-primary">{t("nav.register")}</Link>
            </>
          )}
        </div>
        <button type="button" className="inline-flex items-center justify-center rounded-full p-2 text-primary-900 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-primary-100 bg-background/95 backdrop-blur-md lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {publicNav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-primary-50 hover:text-primary-900">{t(item.key)}</Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <LanguageSwitcher />
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-outline flex-1">{t("nav.dashboard")}</Link>
                  <button type="button" onClick={logout} className="btn-primary flex-1">{t("nav.logout")}</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-outline flex-1">{t("nav.login")}</Link>
                  <Link href="/register" className="btn-primary flex-1">{t("nav.register")}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
