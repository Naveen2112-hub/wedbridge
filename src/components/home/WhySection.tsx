"use client";

import { ShieldCheck, Sparkles, Lock, Headset } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const items = [
  { key: "verified", icon: ShieldCheck },
  { key: "ai", icon: Sparkles },
  { key: "privacy", icon: Lock },
  { key: "support", icon: Headset },
] as const;

export function WhySection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-white">
      <Reveal>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {t("home.why.title")}
          </h2>
          <p className="mt-3 text-neutral-600">{t("home.why.subtitle")}</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.key} delay={i * 100}>
            <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center transition hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                <it.icon className="h-7 w-7 text-rose-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                {t(`home.why.items.${it.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                {t(`home.why.items.${it.key}.desc`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
