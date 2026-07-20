"use client";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Briefcase, Sparkles, Send, Star, Eye, Lightbulb } from "lucide-react";
import { ProfileDocument } from "@/firebase/schema";
import { ScoredMatch } from "@/lib/ai/aiMatchService";
import { calculateAge } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function AiMatchCard({ match }: { match: ScoredMatch }) {
  const { t } = useLanguage();
  const { profile, score, reasons, insights } = match;
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const [open, setOpen] = useState(false);
  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-secondary-600" : "text-primary-700";
  const scoreBg = score >= 80 ? "bg-green-50" : score >= 60 ? "bg-secondary-50" : "bg-primary-50";

  return (
    <div className="group overflow-hidden rounded-2xl bg-card shadow-card transition hover:shadow-glow">
      <Link href={`/profile/${profile.uid}`} className="block" aria-label={`${profile.name} - ${t("search.card.viewProfile")}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-primary-100">
          {profile.photoURL ? <Image src={profile.photoURL} alt={profile.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-primary-300"><Sparkles className="h-10 w-10" /></div>}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary-950/60 to-transparent" />
          <div className={cn("absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur", scoreBg, scoreColor)}><Sparkles className="h-3.5 w-3.5" />{score}%</div>
          <div className="absolute left-3 top-3 flex gap-1.5">
            {profile.verificationStatus === "verified" && <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-primary-800 backdrop-blur"><BadgeCheck className="h-3.5 w-3.5 text-secondary-600" />{t("search.card.verified")}</span>}
            {profile.membership && profile.membership !== "free" && <span className="rounded-full bg-secondary-500 px-2 py-0.5 text-xs font-semibold text-white">{t("search.card.premium")}</span>}
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white"><p className="font-display text-base font-semibold drop-shadow">{profile.name}{age ? `, ${age}` : ""}</p><p className="text-xs text-white/85">{[profile.occupation, profile.district].filter(Boolean).join(" • ")}</p></div>
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[profile.district, profile.state].filter(Boolean).join(", ") || "—"}</span>
          <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{profile.occupation || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted"><Star className="h-3.5 w-3.5" />{profile.religion || "—"} · {profile.caste || "—"}</div>
        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reasons.slice(0, 4).map((r) => <span key={r} className="rounded-full bg-secondary-50 px-2 py-0.5 text-[10px] font-medium text-secondary-800">✓ {t(`ai.reasons.${r}` as never)}</span>)}
          </div>
        )}
        {insights.length > 0 && (
          <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-900"><Lightbulb className="h-3.5 w-3.5" />{t("ai.insights")}</button>
        )}
        {open && insights.length > 0 && (
          <div className="space-y-1 rounded-lg bg-primary-50/60 p-2">
            {insights.map((i) => <p key={i} className="text-xs text-primary-800">• {t(`ai.reasons.${i}` as never)}</p>)}
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Link href={`/profile/${profile.uid}`} className="btn-outline flex-1 justify-center py-2 text-xs"><Eye className="h-3.5 w-3.5" />{t("search.card.viewProfile")}</Link>
          <button type="button" className="btn-primary flex-1 justify-center py-2 text-xs"><Send className="h-3.5 w-3.5" />{t("search.card.interest")}</button>
        </div>
      </div>
    </div>
  );
}
