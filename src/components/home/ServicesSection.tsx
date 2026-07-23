"use client";

import { Users, BadgeCheck, Store, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const items = [
  { key: "matchmaking", icon: Users },
  { key: "verification", icon: BadgeCheck },
  { key: "wedding", icon: Store },
  { key: "astro", icon: Sparkles },
] as const;

export function ServicesSection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-neutral-50">
      <Reveal>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {t("home.services.title")}
          </h2>
          <p className="mt-3 text-neutral-600">{t("home.services.subtitle")}</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.key} delay={i * 100}>
            <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
                <it.icon className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                {t(`home.services.items.${it.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                {t(`home.services.items.${it.key}.desc`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
