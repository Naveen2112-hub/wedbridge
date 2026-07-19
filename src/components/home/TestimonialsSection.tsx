"use client";

import { Quote } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface Testimonial { name: string; role: string; quote: string; }

const testimonials: Testimonial[] = [
  { name: "Lakshmi N.", role: "Parent of bride", quote: "WedBridge gave us confidence. Every profile felt genuine and family-approved." },
  { name: "Suresh K.", role: "Premium member", quote: "The AI matches were remarkably aligned with our expectations. Worth every rupee." },
  { name: "Anitha R.", role: "Bride, Coimbatore", quote: "We planned the entire wedding through the vendor marketplace. Beautiful experience." },
];

export function TestimonialsSection() {
  const { t } = useLanguage();
  return (
    <Section>
      <SectionHeader eyebrow={t("home.testimonials.eyebrow")} title={t("home.testimonials.title")} />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {testimonials.map((tm, i) => (
          <Reveal key={tm.name} delay={i * 0.08}>
            <figure className="card h-full">
              <Quote className="h-8 w-8 text-secondary-400" />
              <blockquote className="mt-4 text-sm leading-relaxed text-ink/80">“{tm.quote}”</blockquote>
              <figcaption className="mt-5 border-t border-primary-50 pt-4">
                <p className="font-display text-base font-semibold text-primary-900">{tm.name}</p>
                <p className="text-xs text-muted">{tm.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
