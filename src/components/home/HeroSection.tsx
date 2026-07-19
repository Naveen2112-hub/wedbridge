"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
export function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-hero-pattern">
      <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" />{t("home.hero.eyebrow")}</p>
          <h1 className="heading-xl mt-5 text-balance">{t("home.hero.title")}</h1>
          <p className="text-lead mt-5 max-w-xl">{t("home.hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/register" className="btn-primary">{t("home.hero.cta.register")}<ArrowRight className="h-4 w-4" /></Link><Link href="/search" className="btn-outline">{t("home.hero.cta.search")}</Link></div>
          <p className="mt-6 flex items-center gap-2 text-xs font-medium text-muted"><ShieldCheck className="h-4 w-4 text-secondary-600" />{t("home.hero.trust")}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-card ring-1 ring-primary-100">
            <Image src="https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg" alt="South Indian wedding couple" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/40 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white p-4 shadow-card ring-1 ring-primary-100 sm:block">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-accent-700"><Sparkles className="h-5 w-5" /></span><div><p className="font-display text-lg font-semibold text-primary-900">AI Match</p><p className="text-xs text-muted">96% compatibility</p></div></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
