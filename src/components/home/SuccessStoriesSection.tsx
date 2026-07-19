"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const stories = [
  { couple: "Priya & Karthik", city: "Chennai", quote: "We matched within two weeks. WedBridge understood our values perfectly.", image: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg" },
  { couple: "Divya & Arjun", city: "Madurai", quote: "The AI suggestions felt personal. Our families connected instantly.", image: "https://images.pexels.com/photos/1456626/pexels-photo-1456626.jpeg" },
  { couple: "Meera & Vignesh", city: "Coimbatore", quote: "From match to wedding, every step was effortless and elegant.", image: "https://images.pexels.com/photos/1024984/pexels-photo-1024984.jpeg" },
];

export function SuccessStoriesSection() {
  const { t } = useLanguage();
  return (
    <Section className="bg-gradient-to-b from-background to-primary-50/30">
      <SectionHeader eyebrow={t("home.success.eyebrow")} title={t("home.success.title")} subtitle={t("home.success.subtitle")} />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {stories.map((s, i) => (
          <Reveal key={s.couple} delay={i * 0.08}>
            <article className="group h-full overflow-hidden rounded-2xl bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow">
              <div className="relative aspect-[5/4] overflow-hidden">
                <Image src={s.image} alt={s.couple} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="flex items-center gap-1.5 font-display text-lg font-semibold"><Heart className="h-4 w-4 text-accent" fill="currentColor" />{s.couple}</p>
                  <p className="text-xs text-white/80">{s.city}</p>
                </div>
              </div>
              <blockquote className="p-5 text-sm leading-relaxed text-ink/80">“{s.quote}”</blockquote>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center"><Link href="/success-stories" className="btn-outline">{t("home.success.cta")}<ArrowRight className="h-4 w-4" /></Link></div>
    </Section>
  );
}
