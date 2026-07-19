"use client";
import Link from "next/link";
import { Smartphone, Apple, Play } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
export function DownloadSection() {
  const { t } = useLanguage();
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-white shadow-card sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />
          <div className="relative">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15"><Smartphone className="h-7 w-7" /></span>
            <p className="eyebrow mt-5 text-secondary-300">{t("home.download.eyebrow")}</p>
            <h2 className="heading-lg mt-3 text-white">{t("home.download.title")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">{t("home.download.subtitle")}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3"><Link href="#" className="btn bg-white text-primary-900 hover:bg-white/90"><Apple className="h-5 w-5" />{t("home.download.appStore")}</Link><Link href="#" className="btn border border-white/40 bg-white/10 text-white hover:bg-white/20"><Play className="h-5 w-5" />{t("home.download.googlePlay")}</Link></div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
