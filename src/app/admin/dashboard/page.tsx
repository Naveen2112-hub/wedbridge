"use client";
import { Users, FileText, Crown, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
const stats = [{ key: "admin.totalUsers" as const, value: "12,480", icon: Users, tint: "bg-primary-50 text-primary-800" }, { key: "admin.totalProfiles" as const, value: "9,120", icon: FileText, tint: "bg-secondary-100 text-secondary-800" }, { key: "admin.pendingApprovals" as const, value: "38", icon: Clock, tint: "bg-accent-100 text-accent-800" }, { key: "admin.premiumMembers" as const, value: "1,260", icon: Crown, tint: "bg-primary-50 text-primary-800" }];
export default function AdminDashboardPage() { return (<AdminGuard><AdminLayout><AdminDashboardContent /></AdminLayout></AdminGuard>); }
function AdminDashboardContent() {
  const { t } = useLanguage();
  return (<div className="space-y-6"><div><h1 className="heading-md">{t("admin.dashboard.title")}</h1><p className="text-lead mt-2">{t("admin.overview")}</p></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{stats.map((s) => (<div key={s.key} className="rounded-2xl bg-card p-6 shadow-card"><span className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.tint}`}><s.icon className="h-6 w-6" /></span><p className="mt-4 font-display text-2xl font-semibold text-primary-900">{s.value}</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">{t(s.key)}</p></div>))}</div><div className="rounded-2xl bg-card p-6 shadow-card"><h2 className="font-display text-lg font-semibold text-primary-900">{t("admin.overview")}</h2><p className="mt-2 text-sm text-muted">Manage users, profiles, vendors, and memberships from the sidebar.</p></div></div>);
}
