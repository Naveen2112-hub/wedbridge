"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const plans = [
  { key: "free", accent: false },
  { key: "premium", accent: true },
  { key: "elite", accent: false },
] as const;

export function MembershipSection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-white">
      <Reveal>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {t("home.membership.title")}
          </h2>
          <p className="mt-3 text-neutral-600">{t("home.membership.subtitle")}</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.key} delay={i * 100}>
            <div
              className={cn(
                "flex flex-col rounded-2xl border p-6 transition hover:shadow-lg",
                p.accent
                  ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500"
                  : "border-neutral-200 bg-white",
              )}
            >
              <p className="text-sm text-neutral-500">
                {t(`home.membership.${p.key}.desc`)}
              </p>
              <h3 className="mt-1 text-xl font-bold text-neutral-900">
                {t(`home.membership.${p.key}.name`)}
              </h3>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                {t(`home.membership.${p.key}.price`)}
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-neutral-700"
                  >
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    {t(`home.membership.${p.key}.features.${idx}`)}
                  </li>
                ))}
              </ul>
              <button
                className={cn(
                  "mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition",
                  p.accent
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-neutral-800 hover:bg-neutral-700",
                )}
              >
                {t("home.membership.cta")}
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
