"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Users, CircleUser as UserCircle, CloudUpload as UploadCloud, ScanLine, CreditCard, Wallet, Store, CalendarCheck, Bell, ChartBar as BarChart3, ChartBar as FileBarChart, Settings, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/profiles", label: "Profiles", icon: UserCircle },
  { href: "/admin/bulk-upload", label: "Bulk Upload", icon: UploadCloud },
  { href: "/admin/ocr-upload", label: "OCR Upload", icon: ScanLine },
  { href: "/admin/membership", label: "Membership", icon: CreditCard },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/vendors", label: "Wedding Vendors", icon: Store },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <AdminAuthProvider>
      {isLogin ? <>{children}</> : <AdminRouteGuard><AdminShell>{children}</AdminShell></AdminRouteGuard>}
    </AdminAuthProvider>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { adminUser, logout } = useAdminAuth();

  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-primary-50/50">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 transform bg-primary-900 text-white transition-transform duration-200 lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-bold"><ShieldCheck className="h-6 w-6 text-secondary-400" />Admin Panel</Link>
          <button type="button" onClick={() => setOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-2 space-y-1 overflow-y-auto px-3 pb-4" style={{ maxHeight: "calc(100vh - 4rem)" }}>
          {nav.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", isActive(item.href) ? "bg-primary-700 text-white" : "text-primary-100 hover:bg-primary-800")}><Icon className="h-4 w-4" />{item.label}</Link>;
          })}
          <button type="button" onClick={() => logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-100 transition hover:bg-red-900/40 hover:text-white"><LogOut className="h-4 w-4" />Logout</button>
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-primary-100 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right"><p className="text-sm font-semibold text-primary-900">{adminUser?.displayName ?? "Admin"}</p><p className="text-xs text-muted">{adminUser?.email}</p></div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">{(adminUser?.displayName ?? "A").charAt(0).toUpperCase()}</span>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
