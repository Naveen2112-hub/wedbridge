"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader as Loader2, Pencil, ShieldCheck, Eye, EyeOff, UserX, CircleAlert as AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { ProfileView } from "@/components/profile/ProfileView";
import { CompletionCard } from "@/components/profile/CompletionCard";
import { getProfileByUserId, saveProfile } from "@/lib/profile/profileService";
import type { ProfileDocument } from "@/firebase/schema";

export default function ProfilePage() { return <AuthGuard><ProtectedLayout><ProfileContent /></ProtectedLayout></AuthGuard>; }

function ProfileContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => { (async () => { if (!user) return; const p = await getProfileByUserId(user.uid); setProfile(p); setLoading(false); })(); }, [user]);

  const toggleVisibility = async () => {
    if (!user || !profile) return;
    const next = profile.profileVisibility === "visible" ? "hidden" : "visible";
    setAction("visibility");
    try { await saveProfile(user.uid, { profileVisibility: next }); setProfile({ ...profile, profileVisibility: next }); } finally { setAction(null); }
  };
  const toggleDeactivate = async () => {
    if (!user || !profile) return;
    const next = profile.accountStatus === "active" ? "deactivated" : "active";
    setAction("status");
    try { await saveProfile(user.uid, { accountStatus: next }); setProfile({ ...profile, accountStatus: next }); } finally { setAction(null); }
  };
  const submitVerification = async () => {
    if (!user || !profile) return;
    setAction("verify");
    try { await saveProfile(user.uid, { verificationStatus: "pending" as const }); setProfile({ ...profile, verificationStatus: "pending" }); } finally { setAction(null); }
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-800" /></div>;
  if (!profile) return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-md">
      <AlertCircle className="mx-auto h-10 w-10 text-accent-600" />
      <h1 className="heading-md mt-4">No profile yet</h1>
      <p className="text-lead mt-2">Complete your profile to get started.</p>
      <Link href="/complete-profile" className="btn-primary mt-6">{t("profile.edit")}</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading-md">{t("profile.title")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile/edit" className="btn-outline"><Pencil className="h-4 w-4" />{t("profile.edit")}</Link>
          <button onClick={toggleVisibility} disabled={action === "visibility"} className="btn-ghost">{profile.profileVisibility === "visible" ? <><EyeOff className="h-4 w-4" />{t("profile.visibility.hide")}</> : <><Eye className="h-4 w-4" />{t("profile.visibility.show")}</>}</button>
          <button onClick={toggleDeactivate} disabled={action === "status"} className="btn-ghost">{profile.accountStatus === "active" ? <><UserX className="h-4 w-4" />{t("profile.visibility.deactivate")}</> : <>{t("profile.visibility.reactivate")}</>}</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><ProfileView profile={profile} /></div>
        <div className="space-y-6">
          <CompletionCard profile={profile} />
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="font-display text-lg font-semibold text-primary-900">{t("profile.verify.title")}</h3>
            <p className="mt-2 text-sm text-gray-500">{t("profile.verify.desc")}</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <ShieldCheck className={`h-4 w-4 ${profile.verificationStatus === "verified" ? "text-green-600" : "text-gray-500"}`} />
              <span>{t("profile.verify.status")}: <strong className="text-primary-900">{profile.verificationStatus}</strong></span>
            </div>
            {profile.verificationStatus === "unverified" && <button onClick={submitVerification} disabled={action === "verify"} className="btn-primary mt-4 w-full">{t("profile.verify.submit")}</button>}
            {profile.verificationStatus === "pending" && <p className="mt-3 text-xs text-gray-500">{t("profile.verify.submitted")}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
