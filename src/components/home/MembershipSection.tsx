"use client";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
const plans = [{ key: "free", accent: false }, { key: "premium", accent: true }, { key: "elite", accent: false }] as const;
export function MembershipSection() {
  const { t } = useLanguage();
  return (<Section id="membership"><div className="mx-auto max-w-2xl text-center"><h2 className="heading-lg">{t("home.membership.title")}</h2><p className="text-lead mt-3">{t("home.membership.subtitle")}</p></div><div className="mt-12 grid gap-6 lg:grid-cols-3">{plans.map((p, i) => (<Reveal key={p.key} delay={i * 0.1}><div className={`relative h-full rounded-3xl p-8 shadow-md transition hover:shadow-lg ${p.accent ? "bg-primary-600 text-white" : "bg-white text-gray-900"}`}><span className={`badge ${p.accent ? "bg-white/15 text-white" : "bg-secondary-100 text-secondary-800"}`}>{t(`home.membership.${p.key}.desc` as never)}</span><h3 className="mt-4 font-display text-2xl font-semibold">{t(`home.membership.${p.key}.name` as never)}</h3><p className="mt-2 font-display text-4xl font-semibold">{t(`home.membership.${p.key}.price` as never)}</p><ul className="mt-6 space-y-3 text-sm">{Array.from({ length: 4 }).map((_, idx) => (<li key={idx} className="flex items-center gap-2"><Check className={`h-4 w-4 ${p.accent ? "text-secondary" : "text-secondary-600"}`} />{t(`home.membership.${p.key}.features.${idx}` as never)}</li>))}</ul><button className={`mt-8 w-full ${p.accent ? "btn-secondary" : "btn-primary"}`}>{t("home.membership.cta")}</button></div></Reveal>))}</div></Section>);
}
