"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";

const stats = [
  { key: "home.stats.profiles" as const, value: 48000 },
  { key: "home.stats.matches" as const, value: 12500 },
  { key: "home.stats.weddings" as const, value: 3200 },
  { key: "home.stats.cities" as const, value: 42 },
];

export function StatsSection() {
  const { t, language } = useLanguage();
  return (
    <section className="border-y border-primary-100 bg-white">
      <div className="container-page grid grid-cols-2 gap-6 py-12 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.key} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="text-center">
            <p className="font-display text-3xl font-semibold text-primary-900 sm:text-4xl">{formatNumber(s.value, language === "ta" ? "ta-IN" : "en-IN")}+</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">{t(s.key)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
