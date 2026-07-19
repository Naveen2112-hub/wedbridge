"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
const stats = [{ key: "profiles", value: "12K+" }, { key: "matches", value: "4.2K+" }, { key: "cities", value: "32" }, { key: "years", value: "8+" }];
export function StatsSection() {
  const { t } = useLanguage();
  return (<Section className="bg-primary-50/40"><div className="grid grid-cols-2 gap-6 lg:grid-cols-4">{stats.map((s, i) => (<motion.div key={s.key} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="rounded-2xl bg-card p-6 text-center shadow-soft"><p className="font-display text-3xl font-semibold text-primary-800">{s.value}</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">{t(`home.stats.${s.key}` as never)}</p></motion.div>))}</div></Section>);
}
