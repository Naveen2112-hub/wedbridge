"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Mail, Lock, CircleAlert as AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { loginSchema, type LoginValues, mapAuthError } from "@/lib/auth/validations";
import { AuthShell, GlassCard } from "@/components/auth/AuthShell";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type UserRole } from "@/firebase/schema";

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const { loginWithEmail, logout, configured } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setAuthError(null);
    try {
      const user = await loginWithEmail(values.email, values.password);
      if (!db) throw new Error("auth.error.notConfigured");
      const snap = await getDoc(doc(db, collections.users, user.uid));
      const role = (snap.data()?.role as UserRole) ?? "user";
      if (role !== "admin") {
        setAuthError("auth.admin.notAuthorized");
        await logout();
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      if (err instanceof Error && err.message === "auth.admin.notAuthorized") {
        setAuthError("auth.admin.notAuthorized");
      } else {
        setAuthError(mapAuthError(err));
      }
    }
  };

  return (
    <AuthShell>
      <GlassCard>
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-950 text-secondary"><Shield className="h-6 w-6" /></span>
          <h1 className="heading-md mt-4">{t("auth.admin.title")}</h1>
          <p className="text-lead mt-2">{t("auth.admin.subtitle")}</p>
        </div>

        {!configured && <p className="mb-4 rounded-xl bg-accent-50 p-3 text-center text-sm text-accent-800">{t("auth.error.notConfigured")}</p>}
        {authError && <p className="mb-4 flex items-center gap-2 rounded-xl bg-accent-50 p-3 text-sm text-accent-800"><AlertCircle className="h-4 w-4" />{t(authError as never)}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">{t("auth.admin.email")}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="email" type="email" autoComplete="email" className="auth-input pl-10" {...register("email")} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-accent-700">{t(`auth.error.${errors.email.message}` as never)}</p>}
          </div>
          <div>
            <label className="label" htmlFor="password">{t("auth.admin.password")}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="password" type="password" autoComplete="current-password" className="auth-input pl-10" {...register("password")} />
            </div>
            {errors.password && <p className="mt-1 text-xs text-accent-700">{t("auth.error.required")}</p>}
          </div>
          <SubmitButton loading={isSubmitting}>{t("auth.admin.submit")}</SubmitButton>
        </form>
      </GlassCard>
    </AuthShell>
  );
}
