"use client";
import Image from "next/image";
import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
const stories = [{ names: "Priya & Karthik", image: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg", quote: "We matched in days, married in months. Forever grateful." }, { names: "Divya & Arjun", image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", quote: "WedBridge's AI understood our values better than we did." }, { names: "Meena & Vignesh", image: "https://images.pexels.com/photos/1456626/pexels-photo-1456626.jpeg", quote: "Verified profiles gave our families peace of mind." }];
export function SuccessStoriesSection() {
  const { t } = useLanguage();
  return (<Section className="bg-primary-50/30"><div className="mx-auto max-w-2xl text-center"><h2 className="heading-lg">{t("home.success.title")}</h2><p className="text-lead mt-3">{t("home.success.subtitle")}</p></div><div className="mt-12 grid gap-6 md:grid-cols-3">{stories.map((s, i) => (<Reveal key={s.names} delay={i * 0.1}><div className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="relative aspect-[4/3] overflow-hidden"><Image src={s.image} alt={s.names} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div><div className="p-6"><div className="flex gap-1 text-secondary-500">{Array.from({ length: 5 }).map((_, idx) => <Star key={idx} className="h-4 w-4" fill="currentColor" />)}</div><p className="mt-3 text-sm text-gray-900/80">&ldquo;{s.quote}&rdquo;</p><p className="mt-3 font-display text-sm font-semibold text-primary-900">{s.names}</p></div></div></Reveal>))}</div></Section>);
}
