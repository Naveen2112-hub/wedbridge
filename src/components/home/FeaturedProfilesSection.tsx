"use client";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
const profiles = [{ name: "Priya R.", age: 27, location: "Chennai", image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg" }, { name: "Karthik S.", age: 29, location: "Coimbatore", image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg" }, { name: "Divya M.", age: 25, location: "Madurai", image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" }, { name: "Arjun V.", age: 31, location: "Salem", image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg" }];
export function FeaturedProfilesSection() {
  const { t } = useLanguage();
  return (<Section className="bg-primary-50/30"><div className="flex items-end justify-between gap-4"><div><h2 className="heading-lg">{t("home.featured.title")}</h2><p className="text-lead mt-3">{t("home.featured.subtitle")}</p></div><Link href="/search" className="hidden btn-outline sm:inline-flex">{t("home.featured.viewAll")}</Link></div><div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{profiles.map((p, i) => (<Reveal key={p.name} delay={i * 0.08}><div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"><div className="relative aspect-[3/4] overflow-hidden"><Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" /><span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-primary-800 backdrop-blur"><BadgeCheck className="h-3.5 w-3.5 text-secondary-600" />Verified</span></div><div className="p-4"><p className="font-display text-base font-semibold text-primary-900">{p.name}, {p.age}</p><p className="text-xs text-gray-500">{p.location}</p></div></div></Reveal>))}</div></Section>);
}
