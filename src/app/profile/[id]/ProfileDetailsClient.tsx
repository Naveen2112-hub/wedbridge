"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, Send, ShieldCheck, Loader as Loader2 } from "lucide-react";
import { ProfileDocument } from "@/firebase/schema";
import { getProfile } from "@/lib/profile/profileService";
import { getRelatedProfiles, recordProfileView, addRecentlyViewed } from "@/lib/search/searchService";
import { ProfileView } from "@/components/profile/ProfileView";
import { RelatedProfiles } from "@/components/search/RelatedProfiles";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ProfileDetailsClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [related, setRelated] = useState<ProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);

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
    })();
  }, [id, user?.uid]);

  if (loading) return (<AuthGuard><ProtectedLayout><div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-800" /></div></ProtectedLayout></AuthGuard>);
  if (!profile) return (
    <AuthGuard><ProtectedLayout><div className="mx-auto max-w-md py-16 text-center"><h1 className="heading-md">{t("profile.details.notFound")}</h1><button onClick={() => router.back()} className="btn-primary mt-6">{t("profile.details.backToSearch")}</button></div></ProtectedLayout></AuthGuard>
  );

  const isOwn = user?.uid === id;
  const showContact = isOwn || profile.contactVisibility === "everyone";

  return (
    <AuthGuard><ProtectedLayout>
      <div className="space-y-8">
        <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-900"><ArrowLeft className="h-4 w-4" />{t("profile.details.backToSearch")}</Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800"><Eye className="h-3.5 w-3.5" />{t("profile.details.views")}: {profile.viewCount ?? 0}</span>
            {profile.verificationStatus === "verified" && <span className="flex items-center gap-1 rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-800"><ShieldCheck className="h-3.5 w-3.5" />{t("profile.verified")}</span>}
          </div>
          {!isOwn && <div className="flex gap-2"><button className="btn-primary"><Send className="h-4 w-4" />{t("profile.details.sendInterest")}</button></div>}
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
