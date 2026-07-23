"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/search", label: "Find Matches" },
  { href: "/matches", label: "AI Matches" },
  { href: "/services", label: "Marketplace" },
  { href: "/membership", label: "Membership" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors",
        scrolled
          ? "border-neutral-200 bg-white/90 backdrop-blur"
          : "border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-600" />
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            WedBridge
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (pathname ?? "").startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-medium transition",
                  active
                    ? "text-rose-600"
                    : "text-neutral-600 hover:text-neutral-900",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Register Free
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="h-6 w-6 text-neutral-700" />
          ) : (
            <Menu className="h-6 w-6 text-neutral-700" />
          )}
        </button>
      </nav>

      {open && (
        <div className="border-t border-neutral-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-neutral-700"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3">
              <Link
                href="/login"
                className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Register Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
