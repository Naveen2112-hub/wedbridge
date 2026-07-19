"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Mail, Lock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { loginSchema, type LoginValues, mapAuthError } from "@/lib/auth/validations";
import { AuthShell, GlassCard } from "@/components/auth/AuthShell";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type UserRole } from "@/firebase/schema";

export default function LoginPage() {
  const { t } = useLanguage();
  const { loginWithEmail, loginWithGoogle, configured } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const routeAfterAuth = (role: string | null) => router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");

  const onSubmit = async (values: LoginValues) => {
    setAuthError(null);
    try {
      const user = await loginWithEmail(values.email, values.password);
      if (!db) { routeAfterAuth("user"); return; }
      const snap = await getDoc(doc(db, collections.users, user.uid));
      const role = (snap.data()?.role as UserRole) ?? "user";
      routeAfterAuth(role);
    } catch (err) { setAuthError(mapAuthError(err)); }
  };

  const onGoogle = async () => {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      if (!db) { routeAfterAuth("user"); return; }
      const snap = await getDoc(doc(db, collections.users, user.uid));
      const role = (snap.data()?.role as UserRole) ?? "user";
      routeAfterAuth(role);
    } catch (err) { setAuthError(mapAuthError(err)); } finally { setGoogleLoading(false); }
  };

  return (
    <AuthShell>
      <GlassCard>
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-800"><Heart className="h-6 w-6" fill="currentColor" /></span>
          <h1 className="heading-md mt-4">{t("auth.login.title")}</h1>
          <p className="text-lead mt-2">{t("auth.login.subtitle")}</p>
        </div>
        {!configured && <p className="mb-4 rounded-xl bg-accent-50 p-3 text-center text-sm text-accent-800">{t("auth.error.notConfigured")}</p>}
        {authError && <p className="mb-4 flex items-center gap-2 rounded-xl bg-accent-50 p-3 text-sm text-accent-800"><AlertCircle className="h-4 w-4" />{t(authError as never)}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">{t("auth.login.email")}</label>
            <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input id="email" type="email" autoComplete="email" className="auth-input pl-10" {...register("email")} /></div>
            {errors.email && <p className="mt-1 text-xs text-accent-700">{t(`auth.error.${errors.email.message}` as never)}</p>}
          </div>
          <div>
            <label className="label" htmlFor="password">{t("auth.login.password")}</label>
            <div className="relative"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input id="password" type="password" autoComplete="current-password" className="auth-input pl-10" {...register("password")} /></div>
            {errors.password && <p className="mt-1 text-xs text-accent-700">{t("auth.error.required")}</p>}
          </div>
          <div className="flex justify-end"><Link href="/forgot-password" className="text-xs font-medium text-secondary-700 hover:text-secondary-900">{t("auth.login.forgot")}</Link></div>
          <SubmitButton loading={isSubmitting}>{t("auth.login.submit")}</SubmitButton>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-primary-100" />or<span className="h-px flex-1 bg-primary-100" /></div>
        <GoogleButton onClick={onGoogle} loading={googleLoading} label={t("auth.login.google")} />
        <p className="mt-6 text-center text-sm text-muted">{t("auth.login.noAccount")} <Link href="/register" className="font-semibold text-primary-800 hover:text-primary-900">{t("nav.register")}</Link></p>
      </GlassCard>
    </AuthShell>
  );
}
