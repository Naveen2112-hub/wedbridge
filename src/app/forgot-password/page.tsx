"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Mail, CircleAlert as AlertCircle, ArrowLeft, CircleCheck as CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { forgotSchema, type ForgotValues, mapAuthError } from "@/lib/auth/validations";
import { AuthShell, GlassCard } from "@/components/auth/AuthShell";
import { SubmitButton } from "@/components/auth/SubmitButton";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const { resetPassword, configured } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });
  const onSubmit = async (values: ForgotValues) => { setAuthError(null); try { await resetPassword(values.email); setSent(true); } catch (err) { setAuthError(mapAuthError(err)); } };
  return (
    <AuthShell><GlassCard>
      <div className="mb-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-800"><Heart className="h-6 w-6" fill="currentColor" /></span><h1 className="heading-md mt-4">{t("auth.forgot.title")}</h1><p className="text-lead mt-2">{t("auth.forgot.subtitle")}</p></div>
      {!configured && <p className="mb-4 rounded-xl bg-accent-50 p-3 text-center text-sm text-accent-800">{t("auth.error.notConfigured")}</p>}
      {authError && <p className="mb-4 flex items-center gap-2 rounded-xl bg-accent-50 p-3 text-sm text-accent-800"><AlertCircle className="h-4 w-4" />{t(authError as never)}</p>}
      {sent && <p className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{t("auth.forgot.sent")}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><label className="label" htmlFor="email">{t("auth.forgot.email")}</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input id="email" type="email" autoComplete="email" className="auth-input pl-10" {...register("email")} /></div>{errors.email && <p className="mt-1 text-xs text-accent-700">{t(`auth.error.${errors.email.message}` as never)}</p>}</div>
        <SubmitButton loading={isSubmitting}>{t("auth.forgot.submit")}</SubmitButton>
      </form>
      <p className="mt-6 text-center"><Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-700 hover:text-secondary-900"><ArrowLeft className="h-4 w-4" />{t("auth.forgot.back")}</Link></p>
    </GlassCard></AuthShell>
  );
}
