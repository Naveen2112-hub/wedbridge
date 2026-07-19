"use client";
import { ShieldCheck, Sparkles, Lock, Headset } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
const items = [{ key: "verified", icon: ShieldCheck }, { key: "ai", icon: Sparkles }, { key: "privacy", icon: Lock }, { key: "support", icon: Headset }] as const;
export function WhySection() {
  const { t } = useLanguage();
  return (<Section id="why"><div className="mx-auto max-w-2xl text-center"><h2 className="heading-lg">{t("home.why.title")}</h2><p className="text-lead mt-3">{t("home.why.subtitle")}</p></div><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{items.map((it, i) => (<Reveal key={it.key} delay={i * 0.08}><div className="h-full rounded-2xl bg-card p-6 shadow-soft transition hover:shadow-card"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-800"><it.icon className="h-6 w-6" /></span><h3 className="mt-4 font-display text-lg font-semibold text-primary-900">{t(`home.why.items.${it.key}.title` as never)}</h3><p className="mt-2 text-sm text-muted">{t(`home.why.items.${it.key}.desc` as never)}</p></div></Reveal>))}</div></Section>);
}
