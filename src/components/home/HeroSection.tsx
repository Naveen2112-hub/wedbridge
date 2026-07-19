"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-hero-pattern">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="badge-secondary">{t("home.hero.badge")}</span>
          <h1 className="heading-lg mt-5">{t("home.hero.title")}</h1>
          <p className="text-lead mt-4 max-w-md">{t("home.hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">{t("home.hero.cta")}<ArrowRight className="h-4 w-4" /></Link>
            <Link href="/search" className="btn-outline">{t("home.hero.secondary")}</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary-600" />{t("home.why.items.verified.title")}</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-secondary-600" />{t("home.why.items.ai.title")}</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card">
          <Image src="https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg" alt="WedBridge couple" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/50 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl bg-white/85 p-4 backdrop-blur-md"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"><Heart className="h-5 w-5" fill="currentColor" /></span><div><p className="text-sm font-semibold text-primary-900">12,000+ matches made</p><p className="text-xs text-muted">Across Tamil Nadu & South India</p></div></div>
        </motion.div>
      </div>
    </section>
  );
}
