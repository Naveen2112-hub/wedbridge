"use client";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Crown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
const profiles = [
  { name: "Priya R.", age: 27, location: "Chennai", profession: "Software Engineer", image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg", verified: true, premium: true },
  { name: "Karthik S.", age: 29, location: "Bengaluru", profession: "Doctor", image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", verified: true, premium: false },
  { name: "Divya M.", age: 25, location: "Coimbatore", profession: "Architect", image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg", verified: true, premium: true },
  { name: "Arjun V.", age: 31, location: "Madurai", profession: "Bank Manager", image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", verified: true, premium: false },
];
export function FeaturedProfilesSection() {
  const { t } = useLanguage();
  return (
    <Section className="bg-gradient-to-b from-background to-primary-50/30">
      <SectionHeader eyebrow={t("home.featured.eyebrow")} title={t("home.featured.title")} subtitle={t("home.featured.subtitle")} />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {profiles.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
            <article className="group overflow-hidden rounded-2xl bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute left-3 top-3 flex gap-1.5">{p.verified && <span className="badge-verified"><BadgeCheck className="h-3 w-3" />{t("home.featured.verified")}</span>}{p.premium && <span className="badge-secondary"><Crown className="h-3 w-3" />{t("home.featured.premium")}</span>}</div>
              </div>
              <div className="p-4"><div className="flex items-center justify-between"><h3 className="font-display text-lg font-semibold text-primary-900">{p.name}</h3><span className="text-sm text-muted">{p.age} yrs</span></div><p className="mt-1 text-sm text-muted">{p.profession}</p><p className="text-xs text-muted/80">{p.location}</p></div>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center"><Link href="/search" className="btn-outline">{t("home.featured.viewAll")}<ArrowRight className="h-4 w-4" /></Link></div>
    </Section>
  );
}
