"use client";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
export function AISection() {
  const { t } = useLanguage();
  return (<Section><div className="grid items-center gap-10 lg:grid-cols-2"><Reveal><div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card"><Image src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg" alt="AI matching" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /></div></Reveal><Reveal delay={0.1}><span className="badge-secondary"><Sparkles className="h-3.5 w-3.5" />{t("home.ai.subtitle")}</span><h2 className="heading-lg mt-4">{t("home.ai.title")}</h2><p className="text-lead mt-4 max-w-md">{t("home.ai.desc")}</p><Link href="/register" className="btn-primary mt-6">{t("home.ai.cta")}<ArrowRight className="h-4 w-4" /></Link></Reveal></div></Section>);
}
