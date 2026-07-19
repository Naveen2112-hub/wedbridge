"use client";
import Link from "next/link";
import { Download } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
export function DownloadSection() {
  const { t } = useLanguage();
  return (<Section><div className="relative overflow-hidden rounded-3xl bg-primary-950 p-10 text-center text-white shadow-card sm:p-16"><div className="absolute inset-0 bg-hero-pattern opacity-30" /><div className="relative"><Reveal><h2 className="heading-lg text-white">{t("home.download.title")}</h2><p className="mt-3 text-white/70">{t("home.download.subtitle")}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/" className="btn-secondary"><Download className="h-4 w-4" />{t("home.download.ios")}</Link><Link href="/" className="btn-outline bg-white/10 text-white hover:bg-white/20"><Download className="h-4 w-4" />{t("home.download.android")}</Link></div></Reveal></div></div></Section>);
}
