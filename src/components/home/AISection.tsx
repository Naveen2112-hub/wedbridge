"use client";
import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
const features = ["home.ai.f1" as const, "home.ai.f2" as const, "home.ai.f3" as const, "home.ai.f4" as const];
export function AISection() {
  const { t } = useLanguage();
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal><div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card ring-1 ring-primary-100"><Image src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg" alt="AI matchmaking" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div></Reveal>
        <Reveal delay={0.1}>
          <SectionHeader align="left" eyebrow={t("home.ai.eyebrow")} title={t("home.ai.title")} subtitle={t("home.ai.subtitle")} />
          <ul className="mt-8 space-y-3">{features.map((f) => (<li key={f} className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-secondary-100 text-secondary-800"><Check className="h-3.5 w-3.5" /></span><span className="text-sm text-ink/80">{t(f)}</span></li>))}</ul>
          <Link href="/ai-matches" className="btn-primary mt-8">{t("home.ai.cta")}<ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
      </div>
    </Section>
  );
}
