"use client";
import { useEffect, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Loader2, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, role, loading, configured, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  useEffect(() => { if (loading) return; if (!configured) return; if (!user) { router.replace("/admin/login"); return; } if (role !== "admin") { setDenied(true); (async () => { await logout(); setTimeout(() => router.replace("/admin/login"), 1500); })(); } }, [user, role, loading, configured, router, logout]);
  if (!configured) return (<div className="flex min-h-[60vh] items-center justify-center bg-grain"><p className="text-sm text-muted">Firebase is not configured.</p></div>);
  if (loading || (!user && !denied)) return (<div className="flex min-h-[60vh] items-center justify-center bg-grain"><Loader2 className="h-8 w-8 animate-spin text-primary-800" /></div>);
  if (denied || role !== "admin") return (<div className="flex min-h-[60vh] items-center justify-center bg-grain"><div className="mx-auto max-w-md px-6 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700"><ShieldAlert className="h-7 w-7" /></span><h1 className="heading-md mt-5">{t("auth.admin.notAuthorized")}</h1><p className="text-lead mt-2">Redirecting to admin login…</p></div></div>);
  return <>{children}</>;
}
