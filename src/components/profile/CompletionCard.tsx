"use client";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ProfileDocument } from "@/firebase/schema";
import { calculateCompletion } from "@/lib/profile/profileService";

const FIELD_LABELS: Record<string, string> = {
  fatherName: "profile.fatherName", motherName: "profile.motherName", brothers: "profile.brothers", sisters: "profile.sisters",
  familyType: "profile.familyType", familyStatus: "profile.familyStatus", lifestyle: "profile.lifestyle", foodPreference: "profile.food",
  smoking: "profile.smoking", drinking: "profile.drinking", horoscope: "profile.horoscope", star: "profile.star", rasi: "profile.rasi",
  manglik: "profile.manglik", aboutMe: "profile.aboutMe", partnerPreference: "profile.partnerPref",
  photoURL: "profile.photo", name: "auth.complete.name", dateOfBirth: "auth.complete.dob", religion: "auth.complete.religion",
  caste: "auth.complete.caste", motherTongue: "auth.complete.motherTongue", district: "auth.complete.district", state: "auth.complete.state",
  country: "auth.complete.country", phone: "auth.complete.phone", maritalStatus: "auth.complete.maritalStatus", height: "auth.complete.height",
  education: "auth.complete.education", occupation: "auth.complete.occupation", annualIncome: "auth.complete.annualIncome",
};

export function CompletionCard({ profile }: { profile: Partial<ProfileDocument> }) {
  const { t } = useLanguage();
  const { percentage, filled, total, missing } = calculateCompletion(profile);
  const reached = percentage >= 50;
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-primary-900">{t("profile.completion")}</h3>
        <span className={cn("badge", reached ? "bg-green-50 text-green-700" : "bg-accent-50 text-accent-700")}>{percentage}%</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-primary-50">
        <div className={cn("h-full rounded-full transition-all", reached ? "bg-green-500" : "bg-secondary")} style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">{filled}/{total} fields · {t("profile.completionTarget")}</p>
      {missing.length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-900"><AlertCircle className="h-3.5 w-3.5" />{t("profile.suggested")}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{missing.slice(0, 8).map((f) => <span key={f} className="badge bg-primary-50 text-primary-800">{t((FIELD_LABELS[f] ?? f) as never)}</span>)}</div>
        </div>
      )}
      {reached && <p className="mt-4 flex items-center gap-1.5 text-xs text-green-700"><CheckCircle2 className="h-4 w-4" />{t("profile.completionTarget")}</p>}
    </div>
  );
}
