"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flower2, UtensilsCrossed, Camera, Music } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const services = [
  { icon: Flower2, titleKey: "home.services.decor.title" as const, descKey: "home.services.decor.desc" as const, image: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg" },
  { icon: UtensilsCrossed, titleKey: "home.services.cater.title" as const, descKey: "home.services.cater.desc" as const, image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg" },
  { icon: Camera, titleKey: "home.services.photo.title" as const, descKey: "home.services.photo.desc" as const, image: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg" },
  { icon: Music, titleKey: "home.services.music.title" as const, descKey: "home.services.music.desc" as const, image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg" },
];

export function ServicesSection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-gradient-to-b from-background to-primary-50/30">
      <SectionHeader
        eyebrow={t("home.services.eyebrow")}
        title={t("home.services.title")}
        subtitle={t("home.services.subtitle")}
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <Reveal key={s.titleKey} delay={i * 0.08}>
            <article className="group h-full overflow-hidden rounded-2xl bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={s.image}
                  alt={t(s.titleKey)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-primary-800 shadow-soft">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="absolute bottom-3 left-3 right-3 font-display text-lg font-semibold text-white">
                  {t(s.titleKey)}
                </h3>
              </div>
              <p className="p-4 text-sm leading-relaxed text-muted">{t(s.descKey)}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/wedding-services" className="btn-outline">
          {t("home.services.cta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
