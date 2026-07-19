"use client";

import { ShieldCheck, Sparkles, EyeOff, Store } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const features = [
  { icon: ShieldCheck, titleKey: "home.why.verified.title" as const, descKey: "home.why.verified.desc" as const, tint: "bg-primary-50 text-primary-800" },
  { icon: Sparkles, titleKey: "home.why.ai.title" as const, descKey: "home.why.ai.desc" as const, tint: "bg-secondary-100 text-secondary-800" },
  { icon: EyeOff, titleKey: "home.why.privacy.title" as const, descKey: "home.why.privacy.desc" as const, tint: "bg-accent-100 text-accent-800" },
  { icon: Store, titleKey: "home.why.services.title" as const, descKey: "home.why.services.desc" as const, tint: "bg-primary-50 text-primary-800" },
];

export function WhySection() {
  const { t } = useLanguage();
  return (
    <Section>
      <SectionHeader eyebrow={t("home.why.eyebrow")} title={t("home.why.title")} subtitle={t("home.why.subtitle")} />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.titleKey} delay={i * 0.08}>
            <div className="card h-full transition hover:-translate-y-1 hover:shadow-glow">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.tint}`}><f.icon className="h-6 w-6" /></span>
              <h3 className="mt-5 font-display text-lg font-semibold text-primary-900">{t(f.titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(f.descKey)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
