"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, CircleAlert as AlertCircle, User, Phone, MapPin, Calendar, Shield, Users, GraduationCap, Briefcase, IndianRupee, HeartHandshake, Ruler } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { completeProfileSchema, type CompleteProfileValues, mapAuthError } from "@/lib/auth/validations";
import { type ContactVisibility, type Gender, type MaritalStatus } from "@/firebase/schema";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { GlassCard } from "@/components/auth/AuthShell";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { PhotoUploader } from "@/components/profile/PhotoUploader";
import { OCRUploader } from "@/components/profile/OCRUploader";
import { CompletionCard } from "@/components/profile/CompletionCard";
import { saveProfile } from "@/lib/profile/profileService";
import type { PartialProfile } from "@/lib/profile/ocrTypes";
import { cn } from "@/lib/cn";

const INDIAN_STATES = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Puducherry"];
const TN_DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur", "Kanyakumari"];
const RELIGIONS = ["Hindu", "Christian", "Muslim", "Jain", "Sikh", "Other"];
const TONGUES = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "English", "Other"];

export default function CompleteProfilePage() {
  const { t } = useLanguage();
  const { completeProfile, user, loading, setProfileCompleted } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState("");
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CompleteProfileValues>({ resolver: zodResolver(completeProfileSchema), defaultValues: { name: user?.displayName ?? "", gender: "male", dateOfBirth: "", religion: "", caste: "", motherTongue: "", district: "", state: "Tamil Nadu", country: "India", phone: "", email: "", photoURL: "", contactVisibility: "after_accept", maritalStatus: "never_married", height: "", education: "", occupation: "", annualIncome: "" } });

  useEffect(() => { if (loading) return; if (!user) router.replace("/login"); }, [user, loading, router]);
  if (loading || !user) return null;

  const visibility = watch("contactVisibility");
  const watched = watch();
  const draftProfile = { ...watched, photoURL, profileVisibility: "visible" as const, accountStatus: "active" as const, verificationStatus: "unverified" as const };

  const onSubmit = async (values: CompleteProfileValues) => {
    setAuthError(null);
    try {
      const payload = { ...values, photoURL };
      await completeProfile({ name: values.name, gender: values.gender, dateOfBirth: values.dateOfBirth, religion: values.religion, caste: values.caste, district: values.district, phone: values.phone, email: values.email || undefined, photoURL, contactVisibility: values.contactVisibility });
      await saveProfile(user.uid, { ...payload, dob: values.dateOfBirth, profileVisibility: "visible", accountStatus: "active", verificationStatus: "unverified" } as never);
      setProfileCompleted(true);
      router.push("/dashboard");
    } catch (err) { setAuthError(mapAuthError(err)); }
  };

  const onOCR = (data: PartialProfile) => {
    if (data.name) setValue("name", data.name);
    if (data.dateOfBirth) setValue("dateOfBirth", data.dateOfBirth);
    if (data.education) setValue("education", data.education);
    if (data.occupation) setValue("occupation", data.occupation);
    if (data.religion) setValue("religion", data.religion);
    if (data.caste) setValue("caste", data.caste);
    if (data.height) setValue("height", data.height);
    if (data.district) setValue("district", data.district);
    if (data.phone) setValue("phone", data.phone);
  };

  const visibilityOptions: { value: ContactVisibility; labelKey: "profile.visibility.visible" | "auth.complete.visibility.afterAccept" | "auth.complete.visibility.premiumOnly" }[] = [
    { value: "everyone", labelKey: "profile.visibility.visible" }, { value: "after_accept", labelKey: "auth.complete.visibility.afterAccept" }, { value: "premium_only", labelKey: "auth.complete.visibility.premiumOnly" },
  ];

  return (
    <PublicLayout>
      <section className="container-page section-pad">
        <div className="mx-auto max-w-3xl">
          <GlassCard>
            <div className="mb-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-800"><Heart className="h-6 w-6" fill="currentColor" /></span>
              <h1 className="heading-md mt-4">{t("auth.complete.title")}</h1>
              <p className="text-lead mt-2">{t("auth.complete.subtitle")}</p>
            </div>

            {authError && <p className="mb-4 flex items-center gap-2 rounded-xl bg-accent-50 p-3 text-sm text-accent-800"><AlertCircle className="h-4 w-4" />{t(authError as never)}</p>}

            <div className="mb-6"><PhotoUploader uid={user.uid} value={photoURL} onChange={setPhotoURL} /></div>
            <div className="mb-8"><OCRUploader onExtract={onOCR} /></div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("auth.complete.name")} icon={User} error={errors.name && t("auth.error.required")}><input className="auth-input pl-10" {...register("name")} /></Field>
                <Field label={t("auth.complete.dob")} icon={Calendar} error={errors.dateOfBirth && t("auth.error.required")}><input type="date" className="auth-input pl-10" {...register("dateOfBirth")} /></Field>
              </div>

              <div><label className="label">{t("auth.complete.gender")}</label><div className="grid grid-cols-3 gap-2">{(["male", "female", "other"] as const).map((g) => (<label key={g} className={cn("cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm transition", watch("gender") === g ? "border-secondary bg-secondary-50 text-primary-900" : "border-primary-100 bg-white text-gray-500 hover:border-primary-300")}><input type="radio" value={g} className="sr-only" {...register("gender")} />{t(`auth.complete.${g}` as never)}</label>))}</div></div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("auth.complete.religion")} icon={Shield} error={errors.religion && t("auth.error.required")}><select className="auth-input pl-10" {...register("religion")}><option value="">Select…</option>{RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
                <Field label={t("auth.complete.caste")} icon={Users} error={errors.caste && t("auth.error.required")}><input className="auth-input pl-10" {...register("caste")} /></Field>
                <Field label={t("auth.complete.motherTongue")} icon={Users} error={errors.motherTongue && t("auth.error.required")}><select className="auth-input pl-10" {...register("motherTongue")}><option value="">Select…</option>{TONGUES.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
                <Field label={t("auth.complete.maritalStatus")} icon={HeartHandshake} error={errors.maritalStatus && t("auth.error.required")}><select className="auth-input pl-10" {...register("maritalStatus")}>{([["never_married", "Never Married"], ["divorced", "Divorced"], ["widowed", "Widowed"], ["awaiting_divorce", "Awaiting Divorce"]] as [MaritalStatus, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t("auth.complete.district")} icon={MapPin} error={errors.district && t("auth.error.required")}><select className="auth-input pl-10" {...register("district")}><option value="">Select…</option>{TN_DISTRICTS.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
                <Field label={t("auth.complete.state")} icon={MapPin} error={errors.state && t("auth.error.required")}><select className="auth-input pl-10" {...register("state")}>{INDIAN_STATES.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
                <Field label={t("auth.complete.country")} icon={MapPin} error={errors.country && t("auth.error.required")}><input className="auth-input pl-10" {...register("country")} /></Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("auth.complete.phone")} icon={Phone} error={errors.phone && t("auth.error.required")}><input type="tel" className="auth-input pl-10" {...register("phone")} /></Field>
                <Field label={t("auth.complete.email")} icon={User} error={errors.email && t("auth.error.email")}><input type="email" className="auth-input pl-10" placeholder={user?.email ?? ""} {...register("email")} /></Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t("auth.complete.height")} icon={Ruler} error={errors.height && t("auth.error.required")}><input placeholder="5'6&quot;" className="auth-input pl-10" {...register("height")} /></Field>
                <Field label={t("auth.complete.education")} icon={GraduationCap} error={errors.education && t("auth.error.required")}><input className="auth-input pl-10" {...register("education")} /></Field>
                <Field label={t("auth.complete.occupation")} icon={Briefcase} error={errors.occupation && t("auth.error.required")}><input className="auth-input pl-10" {...register("occupation")} /></Field>
              </div>

              <Field label={t("auth.complete.annualIncome")} icon={IndianRupee} error={errors.annualIncome && t("auth.error.required")}><input placeholder="₹5,00,000" className="auth-input pl-10" {...register("annualIncome")} /></Field>

              <div><label className="label">{t("auth.complete.contactVisibility")}</label><div className="space-y-2">{visibilityOptions.map((o) => (<label key={o.value} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition", visibility === o.value ? "border-secondary bg-secondary-50 text-primary-900" : "border-primary-100 bg-white text-gray-500 hover:border-primary-300")}><input type="radio" value={o.value} className="sr-only" {...register("contactVisibility")} /><span className={cn("flex h-4 w-4 flex-none items-center justify-center rounded-full border", visibility === o.value ? "border-secondary bg-secondary" : "border-primary-200")}>{visibility === o.value && <span className="h-2 w-2 rounded-full bg-white" />}</span>{t(o.labelKey)}</label>))}</div></div>

              <div className="rounded-2xl bg-primary-50/40 p-4"><CompletionCard profile={draftProfile as never} /></div>

              <SubmitButton loading={isSubmitting}>{t("auth.complete.submit")}</SubmitButton>
            </form>
          </GlassCard>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({ label, icon: Icon, error, children }: { label: string; icon: React.ComponentType<{ className?: string }>; error?: string | null; children: React.ReactNode }) {
  return (<div><label className="label">{label}</label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />{children}</div>{error && <p className="mt-1 text-xs text-accent-700">{error}</p>}</div>);
}
