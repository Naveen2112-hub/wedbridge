"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How does WedBridge verify profiles?",
    a: "Every profile is manually reviewed by our team. We verify phone numbers, photos, and identity documents before activating an account.",
  },
  {
    q: "Is my contact information visible to everyone?",
    a: "No. You control who sees your contact details. By default, they are only visible after an interest is accepted.",
  },
  {
    q: "How does AI matchmaking work?",
    a: "Our AI analyzes 20+ compatibility factors including values, lifestyle, education, and horoscope to suggest the best matches.",
  },
  {
    q: "Can I cancel my membership?",
    a: "Yes, you can cancel anytime from your account settings. Your premium features remain active until the end of your billing period.",
  },
  {
    q: "Is WedBridge only for Tamil Nadu?",
    a: "While we focus on Tamil Nadu and South Indian communities, anyone is welcome to join and find their match.",
  },
];

export function FaqSection() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section className="bg-neutral-50">
      <Reveal>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {t("home.faq.title")}
          </h2>
          <p className="mt-3 text-neutral-600">{t("home.faq.subtitle")}</p>
        </div>
      </Reveal>
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {faqs.map((f, i) => (
          <Reveal key={i} delay={i * 50}>
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-neutral-900">{f.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 text-neutral-400 transition-transform",
                    open === i && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-neutral-600">{f.a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
