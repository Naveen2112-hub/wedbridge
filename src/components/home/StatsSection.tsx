"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const stats = [
  { value: "50,000+", key: "profiles" },
  { value: "12,000+", key: "matches" },
  { value: "120+", key: "cities" },
  { value: "8+", key: "years" },
] as const;

export function StatsSection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-rose-600">
      <Reveal>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t("home.stats.title")}
          </h2>
        </div>
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.key} delay={i * 100}>
            <div className="text-center">
              <p className="text-3xl font-bold text-white sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-rose-100">
                {t(`home.stats.${s.key}`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
