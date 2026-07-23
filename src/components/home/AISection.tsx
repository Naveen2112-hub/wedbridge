"use client";

import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function AISection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-gradient-to-br from-violet-50 via-white to-rose-50">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <div>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
              <Brain className="h-7 w-7 text-violet-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {t("home.ai.title")}
            </h2>
            <p className="mt-3 text-lg text-violet-700">{t("home.ai.subtitle")}</p>
            <p className="mt-4 text-neutral-600">{t("home.ai.desc")}</p>
            <Link
              href="/matches"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              {t("home.ai.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Values", score: "95%" },
              { label: "Lifestyle", score: "88%" },
              { label: "Education", score: "92%" },
              { label: "Horoscope", score: "85%" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-neutral-200 bg-white p-5 text-center"
              >
                <p className="text-3xl font-bold text-violet-600">{item.score}</p>
                <p className="mt-1 text-sm text-neutral-500">{item.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
