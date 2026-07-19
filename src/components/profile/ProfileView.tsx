"use client";
import Image from "next/image";
import { BadgeCheck, Eye, EyeOff, UserX, ShieldCheck, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";
import type { ProfileDocument } from "@/firebase/schema";

export function ProfileView({ profile }: { profile: ProfileDocument }) {
  const { t } = useLanguage();
  const verified = profile.verificationStatus === "verified";
  const pending = profile.verificationStatus === "pending";
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-card sm:p-8">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="relative h-28 w-28 flex-none overflow-hidden rounded-full ring-4 ring-white/30">
            {profile.photoURL ? <img src={profile.photoURL} alt={profile.name} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-white/10 text-sm">No photo</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">{profile.name}</h1>
              {verified && <span className="flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-primary-950"><BadgeCheck className="h-3.5 w-3.5 text-secondary-700" />{t("profile.verified")}</span>}
              {pending && <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white"><Clock className="h-3.5 w-3.5" />{t("profile.pendingVerification")}</span>}
              {!verified && !pending && <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white">{t("profile.unverified")}</span>}
            </div>
            <p className="mt-1 text-sm text-white/80">{profile.gender} · {profile.religion} · {profile.caste}</p>
            <p className="mt-1 text-sm text-white/70">{profile.district}, {profile.state}, {profile.country}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={cn("badge", profile.profileVisibility === "visible" ? "bg-white/15 text-white" : "bg-white/10 text-white/70")}>{profile.profileVisibility === "visible" ? <><Eye className="h-3 w-3" />{t("profile.visibility.visible")}</> : <><EyeOff className="h-3 w-3" />{t("profile.visibility.hidden")}</>}</span>
              {profile.accountStatus === "deactivated" && <span className="badge bg-accent-100 text-accent-800"><UserX className="h-3 w-3" />{t("profile.visibility.deactivated")}</span>}
            </div>
          </div>
        </div>
      </div>

      {profile.gallery && profile.gallery.length > 0 && (
        <Section title={t("profile.gallery")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{profile.gallery.map((g, i) => <div key={i} className="relative aspect-square overflow-hidden rounded-xl"><Image src={g} alt={`Gallery ${i}`} fill sizes="25vw" className="object-cover" /></div>)}</div>
        </Section>
      )}

      <Section title={t("profile.basic")}>
        <Grid>
          <Item label={t("auth.complete.dob")} value={profile.dateOfBirth} />
          <Item label={t("auth.complete.motherTongue")} value={profile.motherTongue} />
          <Item label={t("auth.complete.maritalStatus")} value={profile.maritalStatus} />
          <Item label={t("auth.complete.height")} value={profile.height} />
          <Item label={t("auth.complete.education")} value={profile.education} />
          <Item label={t("auth.complete.occupation")} value={profile.occupation} />
          <Item label={t("auth.complete.annualIncome")} value={profile.annualIncome} />
          <Item label={t("auth.complete.phone")} value={profile.phone} />
        </Grid>
      </Section>

      {profile.aboutMe && <Section title={t("profile.about")}><p className="text-sm text-ink/80">{profile.aboutMe}</p></Section>}

      <Section title={t("profile.family")}>
        <Grid>
          <Item label={t("profile.fatherName")} value={profile.fatherName} />
          <Item label={t("profile.motherName")} value={profile.motherName} />
          <Item label={t("profile.brothers")} value={profile.brothers} />
          <Item label={t("profile.sisters")} value={profile.sisters} />
          <Item label={t("profile.familyType")} value={profile.familyType} />
          <Item label={t("profile.familyStatus")} value={profile.familyStatus} />
        </Grid>
      </Section>

      <Section title={t("profile.lifestyle")}>
        <Grid>
          <Item label={t("profile.lifestyle")} value={profile.lifestyle} />
          <Item label={t("profile.food")} value={profile.foodPreference} />
          <Item label={t("profile.smoking")} value={profile.smoking} />
          <Item label={t("profile.drinking")} value={profile.drinking} />
          <Item label={t("profile.horoscope")} value={profile.horoscope} />
          <Item label={t("profile.star")} value={profile.star} />
          <Item label={t("profile.rasi")} value={profile.rasi} />
          <Item label={t("profile.manglik")} value={profile.manglik} />
        </Grid>
      </Section>

      {profile.partnerPreference && <Section title={t("profile.partner")}><p className="text-sm text-ink/80">{profile.partnerPreference}</p></Section>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="rounded-2xl bg-card p-6 shadow-card"><h2 className="font-display text-lg font-semibold text-primary-900">{title}</h2><div className="mt-4">{children}</div></div>);
}
function Grid({ children }: { children: React.ReactNode }) { return <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>; }
function Item({ label, value }: { label: string; value?: string | null }) {
  return (<div><dt className="text-xs font-medium uppercase tracking-wider text-muted">{label}</dt><dd className="mt-1 text-sm text-ink/90">{value || "—"}</dd></div>);
}
void ShieldCheck;
