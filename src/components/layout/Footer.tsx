"use client";

import Link from "next/link";
import { Heart, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const quickLinks = [
  { href: "/", key: "nav.home" as const },
  { href: "/search", key: "nav.search" as const },
  { href: "/wedding-services", key: "nav.weddingServices" as const },
  { href: "/membership", key: "nav.membership" as const },
  { href: "/about", key: "nav.about" as const },
  { href: "/contact", key: "nav.contact" as const },
];

const supportLinks = [
  { href: "/faq", key: "footer.faq" as const },
  { href: "/help-center", key: "footer.helpCenter" as const },
  { href: "/support", key: "footer.support" as const },
];

const legalLinks = [
  { href: "/legal/privacy-policy", key: "footer.privacyPolicy" as const },
  { href: "/legal/terms", key: "footer.termsConditions" as const },
  { href: "/legal/refund-policy", key: "footer.refundPolicy" as const },
  { href: "/legal/community-guidelines", key: "footer.communityGuidelines" as const },
];

const socials = [
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-primary-100 bg-gradient-to-b from-background to-primary-50/40">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5" aria-label="WedBridge home">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-soft">
                <Heart className="h-5 w-5" fill="currentColor" />
              </span>
              <span className="font-display text-xl font-semibold text-primary-900">
                Wed<span className="text-secondary-600">Bridge</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{t("footer.about")}</p>
            <div className="mt-6">
              <p className="eyebrow">{t("footer.followUs")}</p>
              <div className="mt-3 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-100 bg-white text-primary-800 transition hover:border-secondary hover:text-secondary-700"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="font-display text-base font-semibold text-primary-900">{t("footer.quickLinks")}</p>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-quiet text-sm">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="font-display text-base font-semibold text-primary-900">{t("footer.support")}</p>
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-quiet text-sm">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="font-display text-base font-semibold text-primary-900">{t("footer.legal")}</p>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-quiet text-sm">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-100 pt-6 text-center text-xs text-muted sm:flex-row sm:text-left">
          <p>© {year} WedBridge. {t("footer.rights")}</p>
          <p className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-accent" fill="currentColor" />
            {t("footer.madeWith")}
          </p>
        </div>
      </div>
    </footer>
  );
}
