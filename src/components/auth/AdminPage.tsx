"use client";
import { type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
interface AdminPageProps { title: string; description: string; icon: LucideIcon; children?: React.ReactNode; }
export function AdminPage({ title, description, icon: Icon, children }: AdminPageProps) {
  const { t } = useLanguage();
  return (<AdminGuard><AdminLayout><div className="space-y-6"><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-800"><Icon className="h-6 w-6" /></span><div><h1 className="heading-md">{title}</h1><p className="text-lead mt-1">{description}</p></div></div>{children ?? <div className="rounded-2xl bg-white p-8 shadow-md"><p className="text-sm text-gray-500">{t("admin.overview")}</p></div>}</div></AdminLayout></AdminGuard>);
}
