"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { cn } from "@/lib/cn";

export function Navbar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const links = [{ href: "/", label: t("nav.home") }, { href: "/#why", label: t("home.why.title") }, { href: "/#membership", label: t("home.membership.title") }, { href: "/#faq", label: t("home.faq.title") }];
  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/60 bg-background/85 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="WedBridge home"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-soft"><Heart className="h-4 w-4" fill="currentColor" /></span><span className="font-display text-lg font-semibold text-primary-900">Wed<span className="text-secondary-600">Bridge</span></span></Link>
        <div className="hidden items-center gap-7 md:flex">{links.map((l) => <Link key={l.href} href={l.href} className="text-sm font-medium text-ink/70 transition hover:text-primary-900">{l.label}</Link>)}</div>
        <div className="hidden items-center gap-3 md:flex"><LanguageSwitcher />{user ? <Link href="/dashboard" className="btn-primary">{t("nav.dashboard")}</Link> : <><Link href="/login" className="btn-ghost">{t("nav.login")}</Link><Link href="/register" className="btn-primary">{t("nav.register")}</Link></>}</div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-full p-2 text-primary-900 md:hidden" aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </nav>
      {open && (<div className="border-t border-primary-100 bg-background md:hidden"><div className="container-page space-y-1 py-3">{links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={cn("block rounded-lg px-3 py-2 text-sm font-medium text-ink/80 hover:bg-primary-50")}>{l.label}</Link>)}<div className="flex items-center gap-2 px-3 pt-2"><LanguageSwitcher />{user ? <Link href="/dashboard" className="btn-primary flex-1">{t("nav.dashboard")}</Link> : <><Link href="/login" className="btn-outline flex-1">{t("nav.login")}</Link><Link href="/register" className="btn-primary flex-1">{t("nav.register")}</Link></>}</div></div></div>)}
    </header>
  );
}
