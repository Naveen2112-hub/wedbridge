"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, X, User, LogOut, Search, Store, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { logoutUser } from "@/lib/auth/authService";
import { cn } from "@/lib/utils";

const links = [
  { href: "/search", label: "Find Matches" },
  { href: "/matches", label: "AI Matches" },
  { href: "/services", label: "Marketplace" },
  { href: "/membership", label: "Membership" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, appUser } = useAuth();
  const [open, setOpen] = useState(false);

  const isAdmin = appUser?.role === "admin";
  const isVendor = appUser?.role === "vendor";

  const handleLogout = async () => { await logoutUser(); setOpen(false); };

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary-800" aria-label="WedBridge home">
            <Heart className="h-6 w-6 text-primary-600" fill="currentColor" />
            WedBridge
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={cn("text-sm font-medium transition", pathname === l.href || pathname.startsWith(l.href + "/") ? "text-primary-700" : "text-ink/70 hover:text-primary-700")}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/notifications" className="rounded-lg p-2 text-ink/70 hover:bg-primary-50 hover:text-primary-700" aria-label="Notifications"><Bell className="h-5 w-5" /></Link>
              {isVendor && <Link href="/vendor-dashboard" className="rounded-lg p-2 text-ink/70 hover:bg-primary-50 hover:text-primary-700" aria-label="Vendor Dashboard"><Store className="h-5 w-5" /></Link>}
              {isAdmin && <Link href="/admin" className="rounded-lg p-2 text-ink/70 hover:bg-primary-50 hover:text-primary-700" aria-label="Admin Panel"><User className="h-5 w-5" /></Link>}
              <Link href="/profile" className="btn-primary text-sm">My Profile</Link>
              <button type="button" onClick={handleLogout} className="btn-ghost text-sm" aria-label="Logout"><LogOut className="h-4 w-4" /></button>
            </>
          ) : (
            <>
              <Link href="/search" className="btn-ghost text-sm"><Search className="h-4 w-4" />Browse</Link>
              <Link href="/login" className="btn-ghost text-sm">Login</Link>
              <Link href="/register" className="btn-primary text-sm">Register</Link>
            </>
          )}
        </div>

        <button type="button" onClick={() => setOpen(!open)} className="md:hidden" aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-primary-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-primary-50">{l.label}</Link>)}
            {user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-primary-50">My Profile</Link>
                <Link href="/notifications" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-primary-50">Notifications</Link>
                <button type="button" onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-primary-50">Login</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
