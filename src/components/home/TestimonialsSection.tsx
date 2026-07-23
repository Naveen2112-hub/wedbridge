"use client";
import { useState } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

type Testimonial = {
  name: string;
  text: string;
  image: string;
  alt: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Lakshmi, Chennai",
    text: "My daughter found the perfect match. The verification process gave us confidence.",
    image: "https://images.pexels.com/photos/2747452/pexels-photo-2747452.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
    alt: "Lakshmi from Chennai who found a match on WedBridge",
  },
  {
    name: "Suresh, Coimbatore",
    text: "The AI suggestions were surprisingly accurate. Highly recommend.",
    image: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
    alt: "Suresh from Coimbatore who used WedBridge AI suggestions",
  },
  {
    name: "Revathi, Madurai",
    text: "Privacy-first approach made my family comfortable with the platform.",
    image: "https://images.pexels.com/photos/1024996/pexels-photo-1024996.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
    alt: "Revathi from Madurai who valued WedBridge privacy features",
  },
];

const FALLBACK_IMAGE = "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop";

function TestimonialCard({ tm, index }: { tm: Testimonial; index: number }) {
  const [imgSrc, setImgSrc] = useState(tm.image);

  return (
    <Reveal delay={index * 0.1}>
      <div className="h-full rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-primary-100">
            <Image
              src={imgSrc}
              alt={tm.alt}
              width={64}
              height={64}
              loading="lazy"
              className="object-cover"
              onError={() => setImgSrc(FALLBACK_IMAGE)}
            />
          </div>
          <Quote className="h-6 w-6 shrink-0 text-secondary-500" />
        </div>
        <p className="mt-3 text-sm text-gray-900/80">{tm.text}</p>
        <p className="mt-4 font-display text-sm font-semibold text-primary-900">{tm.name}</p>
      </div>
    </Reveal>
  );
}

export function TestimonialsSection() {
  const { t } = useLanguage();
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="heading-lg">{t("home.testimonials.title")}</h2>
        <p className="text-lead mt-3">{t("home.testimonials.subtitle")}</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((tm, i) => (
          <TestimonialCard key={tm.name} tm={tm} index={i} />
        ))}
      </div>
    </Section>
  );
}
