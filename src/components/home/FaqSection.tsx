"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
const faqs = [{ q: "Is WedBridge free?", a: "Yes — registration, browsing, and AI matches are free. Premium unlocks unlimited interests and contact views." }, { q: "How does verification work?", a: "Every profile is manually reviewed by our team. Verified profiles carry a badge." }, { q: "Is my contact info private?", a: "Absolutely. Your contact details are only shared based on your privacy preference." }, { q: "Which regions do you cover?", a: "We focus on Tamil Nadu and across South India, with 32+ cities." }];
export function FaqSection() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);
  return (<Section id="faq" className="bg-primary-50/30"><div className="mx-auto max-w-2xl text-center"><h2 className="heading-lg">{t("home.faq.title")}</h2><p className="text-lead mt-3">{t("home.faq.subtitle")}</p></div><div className="mx-auto mt-10 max-w-2xl space-y-3">{faqs.map((f, i) => (<div key={i} className="rounded-2xl bg-white shadow-sm"><button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left"><span className="font-display text-base font-semibold text-primary-900">{f.q}</span><ChevronDown className={cn("h-5 w-5 flex-none text-gray-500 transition", open === i && "rotate-180")} /></button>{open === i && <p className="px-5 pb-5 text-sm text-gray-500">{f.a}</p>}</div>))}</div></Section>);
}
