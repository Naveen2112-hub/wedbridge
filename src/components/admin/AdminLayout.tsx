"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileText, Upload, CreditCard, ChartBar as BarChart3, Bell, Settings, LogOut, Store, Calendar } from "lucide-react";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/profiles", label: "Profiles", icon: FileText },
  { href: "/admin/bulk-upload", label: "Bulk Upload", icon: Upload },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, loading, logout } = useAdminAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="skeleton h-8 w-8 rounded-full" /></div>;
  if (!adminUser) { router.push("/admin/login"); return null; }

  const handleLogout = async () => { await logout(); router.push("/admin/login"); };

  return (
    <div className="flex min-h-screen bg-primary-50">
      <aside className="hidden w-64 flex-none border-r border-primary-100 bg-white md:block">
        <div className="p-6"><Link href="/admin/dashboard" className="font-display text-xl font-bold text-primary-900">WedBridge<span className="text-secondary-500"> Admin</span></Link></div>
        <nav className="px-3 pb-4">{nav.map((n) => {
          const active = pathname === n.href || (pathname ?? "").startsWith(n.href + "/");
          return <Link key={n.href} href={n.href} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-primary-700 text-white" : "text-muted hover:bg-primary-50 hover:text-primary-700"}`}><n.icon className="h-4 w-4" />{n.label}</Link>;
        })}</nav>
        <div className="px-3"><button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Logout</button></div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-primary-100 bg-white px-4 py-3 md:hidden"><span className="font-display text-lg font-bold text-primary-900">Admin</span><button type="button" onClick={handleLogout} className="text-sm text-red-600">Logout</button></header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
