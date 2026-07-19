"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Heart, LayoutDashboard, Users, FileText, Store, Crown, Settings, LogOut, Menu, X, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin/dashboard", key: "admin.dashboard.title" as const, icon: LayoutDashboard },
  { href: "/admin/users", key: "admin.users" as const, icon: Users },
  { href: "/admin/profiles", key: "admin.profiles" as const, icon: FileText },
  { href: "/admin/vendors", key: "admin.vendors" as const, icon: Store },
  { href: "/admin/memberships", key: "admin.memberships" as const, icon: Crown },
  { href: "/admin/settings", key: "admin.settings" as const, icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); router.push("/admin/login"); };

  return (
    <div className="flex min-h-screen bg-grain">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-primary-100 bg-primary-950 text-white lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} t={t} onLogout={handleLogout} />
      </aside>
      {open && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-primary-100 bg-primary-950 text-white shadow-card lg:hidden">
          <SidebarContent pathname={pathname} t={t} onLogout={handleLogout} onClose={() => setOpen(false)} />
        </aside>
      )}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary-100 bg-background/90 px-4 backdrop-blur-md lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="rounded-full p-2 text-primary-900 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-soft"><Shield className="h-4 w-4" /></span>
            <span className="font-display text-lg font-semibold text-primary-900">WedBridge <span className="text-secondary-600">Admin</span></span>
          </Link>
          <button type="button" onClick={handleLogout} className="btn-ghost px-3 py-2 text-sm"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">{t("nav.logout")}</span></button>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, t, onLogout, onClose }: { pathname: string; t: (k: never) => string; onLogout: () => void; onClose?: () => void; }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"><Shield className="h-4 w-4" /></span>
          <span className="font-display text-lg font-semibold text-white">Admin</span>
        </Link>
        {onClose && <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white" aria-label="Close menu"><X className="h-5 w-5" /></button>}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={onClose} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white")}>
              <item.icon className="h-4 w-4" />{t(item.key as never)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" />{t("nav.logout" as never)}</button>
      </div>
    </div>
  );
}

void Heart;
