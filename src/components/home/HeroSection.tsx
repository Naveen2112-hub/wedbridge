"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Heart, Users, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/components/ui/Reveal";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700">
              <Sparkles className="h-4 w-4" />
              {t("home.hero.badge")}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-5 text-lg text-neutral-600 sm:text-xl">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500"
              >
                {t("home.hero.cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                {t("home.hero.secondary")}
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8">
            <HeroStat icon={Users} value="50K+" label={t("home.hero.stats.profiles")} />
            <HeroStat icon={Heart} value="12K+" label={t("home.hero.stats.matches")} />
            <HeroStat icon={MapPin} value="120+" label={t("home.hero.stats.cities")} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="h-6 w-6 text-rose-500 sm:h-8 sm:w-8" />
      <span className="text-2xl font-bold text-neutral-900 sm:text-3xl">{value}</span>
      <span className="text-xs text-neutral-500 sm:text-sm">{label}</span>
    </div>
  );
}
