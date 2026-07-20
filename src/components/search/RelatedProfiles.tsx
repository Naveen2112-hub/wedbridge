"use client";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Heart } from "lucide-react";
import { ProfileDocument } from "@/firebase/schema";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function RelatedProfiles({ profiles }: { profiles: ProfileDocument[] }) {
  const { t } = useLanguage();
  if (profiles.length === 0) return null;
  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-primary-900">{t("profile.details.relatedProfiles")}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profiles.map((p) => (
          <Link key={p.uid} href={`/profile/${p.uid}`} className="group overflow-hidden rounded-xl bg-card shadow-card transition hover:shadow-glow">
            <div className="relative aspect-[3/4] overflow-hidden bg-primary-100">{p.photoURL ? <Image src={p.photoURL} alt={p.name} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-primary-300"><Heart className="h-8 w-8" /></div>}</div>
            <div className="flex items-center justify-between p-3"><div><p className="text-sm font-semibold text-primary-900">{p.name}</p><p className="text-xs text-muted">{p.district}</p></div><ChevronRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5" /></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
