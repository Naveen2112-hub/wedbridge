"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const stories = [
  {
    names: "Priya & Karthik",
    image:
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg",
    quote: "We matched in days, married in months. Forever grateful.",
  },
  {
    names: "Divya & Arjun",
    image:
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
    quote: "WedBridge's AI understood our values better than we did.",
  },
  {
    names: "Meena & Vignesh",
    image:
      "https://images.pexels.com/photos/1456626/pexels-photo-1456626.jpeg",
    quote: "Verified profiles gave our families peace of mind.",
  },
];

export function SuccessStoriesSection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-white">
      <Reveal>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {t("home.success.title")}
          </h2>
          <p className="mt-3 text-neutral-600">{t("home.success.subtitle")}</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {stories.map((s, i) => (
          <Reveal key={s.names} delay={i * 100}>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-lg">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.names}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm italic text-neutral-700">
                  &ldquo;{s.quote}&rdquo;
                </p>
                <p className="mt-3 font-semibold text-neutral-900">{s.names}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
