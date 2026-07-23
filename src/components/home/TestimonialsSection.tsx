"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const testimonials = [
  {
    name: "Lakshmi, Chennai",
    text: "My daughter found her match within 3 months. The verified profiles gave us confidence.",
  },
  {
    name: "Rajesh, Coimbatore",
    text: "The AI matching is incredibly accurate. It understood our family values perfectly.",
  },
  {
    name: "Saraswathi, Madurai",
    text: "Excellent support team. They guided us through every step of the process.",
  },
];

export function TestimonialsSection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-neutral-50">
      <Reveal>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {t("home.testimonials.title")}
          </h2>
          <p className="mt-3 text-neutral-600">{t("home.testimonials.subtitle")}</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((tm, i) => (
          <Reveal key={tm.name} delay={i * 100}>
            <blockquote className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:shadow-md">
              <p className="text-sm text-neutral-700">&ldquo;{tm.text}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-neutral-900">
                {tm.name}
              </footer>
            </blockquote>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
