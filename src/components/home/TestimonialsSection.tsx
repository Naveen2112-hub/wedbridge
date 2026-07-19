"use client";
import { Quote } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
const testimonials = [{ name: "Lakshmi, Chennai", text: "My daughter found the perfect match. The verification process gave us confidence." }, { name: "Suresh, Coimbatore", text: "The AI suggestions were surprisingly accurate. Highly recommend." }, { name: "Revathi, Madurai", text: "Privacy-first approach made my family comfortable with the platform." }];
export function TestimonialsSection() {
  const { t } = useLanguage();
  return (<Section><div className="mx-auto max-w-2xl text-center"><h2 className="heading-lg">{t("home.testimonials.title")}</h2><p className="text-lead mt-3">{t("home.testimonials.subtitle")}</p></div><div className="mt-12 grid gap-6 md:grid-cols-3">{testimonials.map((tm, i) => (<Reveal key={tm.name} delay={i * 0.1}><div className="h-full rounded-2xl bg-card p-6 shadow-soft"><Quote className="h-6 w-6 text-secondary-500" /><p className="mt-3 text-sm text-ink/80">{tm.text}</p><p className="mt-4 font-display text-sm font-semibold text-primary-900">{tm.name}</p></div></Reveal>))}</div></Section>);
}
