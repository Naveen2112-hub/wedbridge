"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, Menu, X, User, LogOut, Search, Store, Bell, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = appUser?.role === "admin";
  const isVendor = appUser?.role === "vendor";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => { await logoutUser(); setOpen(false); };

  return (
    <header className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "glass border-b border-primary-100/80 shadow-sm" : "bg-transparent")}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold text-primary-800 transition-transform hover:scale-[1.02]" aria-label="WedBridge home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm shadow-sm">
              <Heart className="h-5 w-5 text-white" fill="currentColor" />
            </span>
            WedBridge
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href || (pathname ?? "").startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} className={cn("nav-link rounded-lg px-3 py-2", active && "nav-link-active bg-primary-50/60")}>
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link href="/notifications" className="relative rounded-lg p-2 text-gray-900/60 transition-colors hover:bg-primary-50 hover:text-primary-700" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Link>
              {isVendor && <Link href="/vendor-dashboard" className="rounded-lg p-2 text-gray-900/60 transition-colors hover:bg-primary-50 hover:text-primary-700" aria-label="Vendor Dashboard"><Store className="h-5 w-5" /></Link>}
              {isAdmin && <Link href="/admin" className="rounded-lg p-2 text-gray-900/60 transition-colors hover:bg-primary-50 hover:text-primary-700" aria-label="Admin Panel"><User className="h-5 w-5" /></Link>}
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

        <button type="button" onClick={() => setOpen(!open)} className="rounded-lg p-2 text-gray-900/70 transition-colors hover:bg-primary-50 md:hidden" aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass overflow-hidden border-t border-primary-100/80 md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((l) => {
                const active = pathname === l.href || (pathname ?? "").startsWith(l.href + "/");
                return (
                  <Link key={l.href} href={l.href} className={cn("block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors", active ? "bg-primary-50 text-primary-700" : "text-gray-900/70 hover:bg-primary-50")}>
                    {l.label}
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-primary-100" />
              {user ? (
                <>
                  <Link href="/profile" className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900/70 hover:bg-primary-50">My Profile</Link>
                  <Link href="/notifications" className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900/70 hover:bg-primary-50">Notifications</Link>
                  {isVendor && <Link href="/vendor-dashboard" className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900/70 hover:bg-primary-50">Vendor Dashboard</Link>}
                  {isAdmin && <Link href="/admin" className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900/70 hover:bg-primary-50">Admin Panel</Link>}
                  <button type="button" onClick={handleLogout} className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-error-600 hover:bg-error-50">Logout</button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/login" className="btn-outline w-full justify-center">Login</Link>
                  <Link href="/register" className="btn-primary w-full justify-center">Register Free</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
