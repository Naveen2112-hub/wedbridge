"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const profiles = [
  {
    name: "Priya R.",
    age: 27,
    location: "Chennai",
    image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg",
  },
  {
    name: "Karthik S.",
    age: 29,
    location: "Coimbatore",
    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
  },
  {
    name: "Divya M.",
    age: 25,
    location: "Madurai",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
  },
  {
    name: "Arjun V.",
    age: 31,
    location: "Salem",
    image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
  },
];

export function FeaturedProfilesSection() {
  const { t } = useLanguage();

  return (
    <Section className="bg-white">
      <Reveal>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {t("home.featured.title")}
            </h2>
            <p className="mt-3 text-neutral-600">{t("home.featured.subtitle")}</p>
          </div>
          <Link
            href="/search"
            className="hidden shrink-0 text-sm font-semibold text-rose-600 hover:underline sm:inline"
          >
            {t("home.featured.viewAll")}
          </Link>
        </div>
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {profiles.map((p, i) => (
          <Reveal key={p.name} delay={i * 100}>
            <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-lg">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-green-700 backdrop-blur">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {t("nav.profile")}
                </span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-neutral-900">
                  {p.name}, {p.age}
                </p>
                <p className="text-sm text-neutral-500">{p.location}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/search"
          className="text-sm font-semibold text-rose-600 hover:underline"
        >
          {t("home.featured.viewAll")}
        </Link>
      </div>
    </Section>
  );
}
