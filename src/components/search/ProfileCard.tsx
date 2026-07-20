"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Briefcase, GraduationCap, Heart, Eye, Sparkles, Star, Send, Loader as Loader2 } from "lucide-react";
import { ProfileDocument } from "@/firebase/schema";
import { calculateAge } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { sendInterest, getInterestBetween, InterestLimitError } from "@/lib/interests/interestService";
import { addFavourite, removeFavourite, isFavourite } from "@/lib/favourites/favouriteService";
import { getProfile } from "@/lib/profile/profileService";
import { cn } from "@/lib/cn";
import { PlanBadge } from "@/components/membership/PlanBadge";

interface Props { profile: ProfileDocument; compatibility?: number; }

export function ProfileCard({ profile, compatibility }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const [interestStatus, setInterestStatus] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);
  const [limitError, setLimitError] = useState(false);

  useEffect(() => {
    if (!user?.uid || user.uid === profile.uid) return;
    (async () => {
      const [interest, f] = await Promise.all([getInterestBetween(user.uid, profile.uid), isFavourite(user.uid, profile.uid)]);
      setInterestStatus(interest?.status ?? null);
      setFav(f);
    })();
  }, [user?.uid, profile.uid]);

  const handleInterest = async () => {
    if (!user?.uid) return;
    setBusy(true); setLimitError(false);
    try {
      const me = await getProfile(user.uid);
      await sendInterest(user.uid, me?.name ?? "Member", profile.uid, me?.membership);
      setInterestStatus("pending");
    } catch (e) {
      if (e instanceof InterestLimitError) setLimitError(true);
    } finally { setBusy(false); }
  };

  const handleFav = async () => {
    if (!user?.uid) return;
    setBusy(true);
    try {
      if (fav) { await removeFavourite(user.uid, profile.uid); setFav(false); }
      else { await addFavourite(user.uid, profile.uid); setFav(true); }
    } finally { setBusy(false); }
  };

  const statusBadge: Record<string, string> = {
    pending: "bg-primary-50 text-primary-800", accepted: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700", cancelled: "bg-muted/20 text-muted", expired: "bg-muted/20 text-muted",
  };

  return (
    <div className="group overflow-hidden rounded-2xl bg-card shadow-card transition hover:shadow-glow">
      <Link href={`/profile/${profile.uid}`} className="block" aria-label={`${profile.name} - ${t("search.card.viewProfile")}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-primary-100">
          {profile.photoURL ? <Image src={profile.photoURL} alt={profile.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-primary-300"><Heart className="h-10 w-10" /></div>}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary-950/60 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-1.5">
            {profile.verificationStatus === "verified" && <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-primary-800 backdrop-blur"><BadgeCheck className="h-3.5 w-3.5 text-secondary-600" />{t("search.card.verified")}</span>}
            {profile.membership && profile.membership !== "free" && <PlanBadge tier={profile.membership} />}
          </div>
          <button type="button" onClick={(e) => { e.preventDefault(); handleFav(); }} disabled={busy} aria-label={t("search.card.favourite")} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110">
            <Star className={cn("h-4 w-4", fav ? "fill-secondary-500 text-secondary-500" : "text-primary-700")} />
          </button>
          {profile.online && <span className="absolute right-3 top-12 flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-xs font-semibold text-white"><span className="h-1.5 w-1.5 rounded-full bg-white" />{t("search.card.online")}</span>}
          <div className="absolute bottom-3 left-3 right-3 text-white"><p className="font-display text-base font-semibold drop-shadow">{profile.name}{age ? `, ${age}` : ""}</p><p className="text-xs text-white/85">{[profile.occupation, profile.district].filter(Boolean).join(" • ")}</p></div>
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[profile.district, profile.state].filter(Boolean).join(", ") || "—"}</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{profile.viewCount ?? 0}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{profile.education || "—"}</span>
          <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{profile.occupation || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted"><Star className="h-3.5 w-3.5" />{profile.religion || "—"} · {profile.caste || "—"}</div>
        {compatibility !== undefined && <div className="flex items-center gap-2 rounded-lg bg-secondary-50 px-2 py-1 text-xs font-semibold text-secondary-800"><Sparkles className="h-3.5 w-3.5" />{t("search.card.compatibility")}: {compatibility}%</div>}
        {interestStatus && <span className={cn("badge", statusBadge[interestStatus] ?? statusBadge.pending)}>{t(`interests.${interestStatus}` as never)}</span>}
        {limitError && <p className="text-xs text-red-600">{t("interests.limitReached")}</p>}
        <div className="flex gap-2 pt-1">
          <Link href={`/profile/${profile.uid}`} className="btn-outline flex-1 justify-center py-2 text-xs">{t("search.card.viewProfile")}</Link>
          <button type="button" onClick={handleInterest} disabled={busy || Boolean(interestStatus)} className="btn-primary flex-1 justify-center py-2 text-xs disabled:opacity-60">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3.5 w-3.5" />{interestStatus ? t(`interests.${interestStatus}` as never) : t("search.card.interest")}</>}</button>
        </div>
      </div>
    </div>
  );
}
