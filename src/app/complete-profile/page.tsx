"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, AlertCircle, User, Phone, MapPin, Calendar, Shield, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { completeProfileSchema, type CompleteProfileValues, mapAuthError } from "@/lib/auth/validations";
import { type ContactVisibility } from "@/firebase/schema";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { GlassCard } from "@/components/auth/AuthShell";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { cn } from "@/lib/cn";

export default function CompleteProfilePage() {
  const { t } = useLanguage();
  const { completeProfile, user, loading } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { name: user?.displayName ?? "", gender: "male", dateOfBirth: "", religion: "", caste: "", district: "", phone: "", email: "", photoURL: "", contactVisibility: "after_accept" },
  });

  if (loading) return null;
  if (!user) { router.replace("/login"); return null; }

  const visibility = watch("contactVisibility");

  const onSubmit = async (values: CompleteProfileValues) => {
    setAuthError(null);
    try { await completeProfile(values); router.push("/dashboard"); }
    catch (err) { setAuthError(mapAuthError(err)); }
  };

  const visibilityOptions: { value: ContactVisibility; labelKey: "auth.complete.visibility.everyone" | "auth.complete.visibility.afterAccept" | "auth.complete.visibility.premiumOnly" }[] = [
    { value: "everyone", labelKey: "auth.complete.visibility.everyone" },
    { value: "after_accept", labelKey: "auth.complete.visibility.afterAccept" },
    { value: "premium_only", labelKey: "auth.complete.visibility.premiumOnly" },
  ];

  return (
    <PublicLayout>
      <section className="container-page section-pad">
        <div className="mx-auto max-w-2xl">
          <GlassCard>
            <div className="mb-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-800"><Heart className="h-6 w-6" fill="currentColor" /></span>
              <h1 className="heading-md mt-4">{t("auth.complete.title")}</h1>
              <p className="text-lead mt-2">{t("auth.complete.subtitle")}</p>
            </div>
            {authError && <p className="mb-4 flex items-center gap-2 rounded-xl bg-accent-50 p-3 text-sm text-accent-800"><AlertCircle className="h-4 w-4" />{t(authError as never)}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("auth.complete.name")} icon={User} error={errors.name && t("auth.error.required")}><input className="auth-input pl-10" {...register("name")} /></Field>
                <Field label={t("auth.complete.dob")} icon={Calendar} error={errors.dateOfBirth && t("auth.error.required")}><input type="date" className="auth-input pl-10" {...register("dateOfBirth")} /></Field>
              </div>
              <div>
                <label className="label">{t("auth.complete.gender")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["male", "female", "other"] as const).map((g) => (
                    <label key={g} className={cn("cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm transition", watch("gender") === g ? "border-secondary bg-secondary-50 text-primary-900" : "border-primary-100 bg-white text-muted hover:border-primary-300")}>
                      <input type="radio" value={g} className="sr-only" {...register("gender")} />{t(`auth.complete.${g}` as never)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("auth.complete.religion")} icon={Shield} error={errors.religion && t("auth.error.required")}><input className="auth-input pl-10" {...register("religion")} /></Field>
                <Field label={t("auth.complete.caste")} icon={Users} error={errors.caste && t("auth.error.required")}><input className="auth-input pl-10" {...register("caste")} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("auth.complete.district")} icon={MapPin} error={errors.district && t("auth.error.required")}><input className="auth-input pl-10" {...register("district")} /></Field>
                <Field label={t("auth.complete.phone")} icon={Phone} error={errors.phone && t("auth.error.required")}><input type="tel" className="auth-input pl-10" {...register("phone")} /></Field>
              </div>
              <Field label={t("auth.complete.email")} icon={User} error={errors.email && t("auth.error.email")}><input type="email" className="auth-input pl-10" placeholder={user?.email ?? ""} {...register("email")} /></Field>
              <div><label className="label">{t("auth.complete.photo")}</label><input type="url" className="auth-input" placeholder="https://…" {...register("photoURL")} /></div>
              <div>
                <label className="label">{t("auth.complete.contactVisibility")}</label>
                <div className="space-y-2">
                  {visibilityOptions.map((o) => (
                    <label key={o.value} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition", visibility === o.value ? "border-secondary bg-secondary-50 text-primary-900" : "border-primary-100 bg-white text-muted hover:border-primary-300")}>
                      <input type="radio" value={o.value} className="sr-only" {...register("contactVisibility")} />
                      <span className={cn("flex h-4 w-4 flex-none items-center justify-center rounded-full border", visibility === o.value ? "border-secondary bg-secondary" : "border-primary-200")}>{visibility === o.value && <span className="h-2 w-2 rounded-full bg-white" />}</span>
                      {t(o.labelKey)}
                    </label>
                  ))}
                </div>
              </div>
              <SubmitButton loading={isSubmitting}>{t("auth.complete.submit")}</SubmitButton>
            </form>
          </GlassCard>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({ label, icon: Icon, error, children }: { label: string; icon: React.ComponentType<{ className?: string }>; error?: string | null; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />{children}</div>
      {error && <p className="mt-1 text-xs text-accent-700">{error}</p>}
    </div>
  );
}
