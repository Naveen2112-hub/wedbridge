"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, Send, ShieldCheck, Loader as Loader2, Star, HeartHandshake } from "lucide-react";
import { ProfileDocument } from "@/firebase/schema";
import { getProfile, getProfileByUserId } from "@/lib/profile/profileService";
import { getRelatedProfiles, recordProfileView, addRecentlyViewed } from "@/lib/search/searchService";
import { ProfileView } from "@/components/profile/ProfileView";
import { RelatedProfiles } from "@/components/search/RelatedProfiles";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { sendInterest, getInterestBetween, InterestLimitError } from "@/lib/interests/interestService";
import { addFavourite, removeFavourite, isFavourite } from "@/lib/favourites/favouriteService";
import { createNotification } from "@/lib/notifications/notificationService";
import { cn } from "@/lib/cn";
import { PlanBadge } from "@/components/membership/PlanBadge";

export default function ProfileDetailsClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [related, setRelated] = useState<ProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestStatus, setInterestStatus] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);
  const [limitError, setLimitError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      const p = await getProfile(id);
      if (!p) { setLoading(false); return; }
      setProfile(p);
      if (user?.uid && user.uid !== id) {
        recordProfileView(user.uid, id).catch(() => {});
        addRecentlyViewed(user.uid, id).catch(() => {});
      }
      const rel = await getRelatedProfiles(p, 4);
      setRelated(rel);
      setLoading(false);
      if (user?.uid && user.uid !== id) {
        const [interest, f] = await Promise.all([getInterestBetween(user.uid, id), isFavourite(user.uid, id)]);
        setInterestStatus(interest?.status ?? null);
        setFav(f);
      }
    })();
  }, [id, user?.uid]);

  if (loading) return (<AuthGuard><ProtectedLayout><div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-800" /></div></ProtectedLayout></AuthGuard>);
  if (!profile) return (
    <AuthGuard><ProtectedLayout><div className="mx-auto max-w-md py-16 text-center"><h1 className="heading-md">{t("profile.details.notFound")}</h1><button onClick={() => router.back()} className="btn-primary mt-6">{t("profile.details.backToSearch")}</button></div></ProtectedLayout></AuthGuard>
  );

  const isOwn = user?.uid === id;
  const showContact = isOwn || profile.contactVisibility === "everyone";

  const handleInterest = async () => {
    if (!user?.uid || !profile) return;
    setBusy(true); setLimitError(false);
    try {
      const me = await getProfileByUserId(user.uid);
      await sendInterest(user.uid, me?.name ?? "Member", id!, me?.membership);
      setInterestStatus("pending");
    } catch (e) {
      if (e instanceof InterestLimitError) setLimitError(true);
    } finally { setBusy(false); }
  };
  const handleFav = async () => {
    if (!user?.uid) return;
    setBusy(true);
    try {
      if (fav) { await removeFavourite(user.uid, id!); setFav(false); }
      else {
        await addFavourite(user.uid, id!); setFav(true);
        await createNotification(profile.userId ?? id!, { title: "Profile Favourited", message: "Someone added you to their favourites.", type: "profile_viewed" });
      }
    } finally { setBusy(false); }
  };
  const statusBadge: Record<string, string> = {
    pending: "bg-primary-50 text-primary-800", accepted: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700", cancelled: "bg-muted/20 text-muted", expired: "bg-muted/20 text-muted",
  };

  return (
    <AuthGuard><ProtectedLayout>
      <div className="space-y-8">
        <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-900"><ArrowLeft className="h-4 w-4" />{t("profile.details.backToSearch")}</Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800"><Eye className="h-3.5 w-3.5" />{t("profile.details.views")}: {profile.viewCount ?? 0}</span>
            {profile.verificationStatus === "verified" && <span className="flex items-center gap-1 rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-800"><ShieldCheck className="h-3.5 w-3.5" />{t("profile.verified")}</span>}
            {profile.membership && profile.membership !== "free" && <PlanBadge tier={profile.membership} />}
          </div>
          {!isOwn && (
            <div className="flex flex-wrap gap-2">
              {interestStatus && <span className={cn("badge", statusBadge[interestStatus] ?? statusBadge.pending)}>{t(`interests.${interestStatus}` as never)}</span>}
              <button type="button" onClick={handleFav} disabled={busy} className="btn-outline"><Star className={cn("h-4 w-4", fav ? "fill-secondary-500 text-secondary-500" : "")} />{fav ? t("search.card.favourited") : t("search.card.favourite")}</button>
              <button type="button" onClick={handleInterest} disabled={busy || Boolean(interestStatus)} className="btn-primary disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{interestStatus ? t(`interests.${interestStatus}` as never) : t("profile.details.sendInterest")}</button>
            </div>
          )}
          {limitError && <p className="text-sm text-red-600">{t("interests.limitReached")}</p>}
        </div>
        <ProfileView profile={profile} />
        {profile.horoscope === "yes" && (
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-primary-900">{t("profile.details.horoscope")}</h3>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><p><span className="text-muted">{t("profile.star")}:</span> {profile.star || "—"}</p><p><span className="text-muted">{t("profile.rasi")}:</span> {profile.rasi || "—"}</p><p><span className="text-muted">{t("profile.manglik")}:</span> {profile.manglik || "—"}</p></div>
          </div>
        )}
        {!showContact && <p className="rounded-xl bg-primary-50/60 p-4 text-xs text-muted">{t("profile.details.contactHidden")}</p>}
        <RelatedProfiles profiles={related} />
      </div>
    </ProtectedLayout></AuthGuard>
  );
}
