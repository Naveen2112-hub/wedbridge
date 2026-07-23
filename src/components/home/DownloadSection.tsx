"use client";

import { Smartphone, Apple } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function DownloadSection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-rose-600">
      <Reveal>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t("home.download.title")}
          </h2>
          <p className="mt-3 text-rose-100">{t("home.download.subtitle")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100">
              <Apple className="h-5 w-5" />
              {t("home.download.ios")}
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100">
              <Smartphone className="h-5 w-5" />
              {t("home.download.android")}
            </button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
