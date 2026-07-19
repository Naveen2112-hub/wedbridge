"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
const faqs = [
  { q: "How are profiles verified on WedBridge?", a: "Every profile undergoes ID verification and biodata OCR review by our team before being marked as verified." },
  { q: "Is my contact information private?", a: "Yes. You control who sees your contact details. Only Premium and Elite members can unlock direct contact access." },
  { q: "How does AI matchmaking work?", a: "Our engine scores compatibility across cultural values, education, profession, lifestyle, and family preferences to surface the best matches." },
  { q: "Can I book wedding vendors through WedBridge?", a: "Yes. Our wedding services marketplace lets you browse and book trusted decorators, caterers, photographers, and musicians." },
  { q: "Which languages does WedBridge support?", a: "WedBridge currently supports English and Tamil, with more South Indian languages planned." },
];
export function FaqSection() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section className="bg-gradient-to-b from-background to-primary-50/30">
      <SectionHeader eyebrow={t("home.faq.eyebrow")} title={t("home.faq.title")} subtitle={t("home.faq.subtitle")} />
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {faqs.map((f, i) => { const isOpen = open === i; return (
          <Reveal key={f.q} delay={i * 0.05}>
            <div className="overflow-hidden rounded-2xl border border-primary-100 bg-card">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={isOpen}><span className="font-display text-base font-semibold text-primary-900">{f.q}</span><ChevronDown className={cn("h-5 w-5 flex-none text-secondary-600 transition", isOpen && "rotate-180")} /></button>
              <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}><div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-muted">{f.a}</p></div></div>
            </div>
          </Reveal>
        ); })}
      </div>
      <p className="mt-8 text-center text-sm text-muted">{t("home.faq.cta")}</p>
    </Section>
  );
}
