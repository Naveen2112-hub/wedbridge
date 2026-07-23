"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Find Matches", href: "/search" },
      { label: "AI Matching", href: "/matches" },
      { label: "Marketplace", href: "/services" },
      { label: "Membership", href: "/membership" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-rose-500" />
              <span className="text-lg font-bold text-white">WedBridge</span>
            </Link>
            <p className="mt-3 text-sm text-neutral-400">
              Tamil Nadu&apos;s premier matrimony platform. Find your perfect
              match with AI-powered matchmaking and premium wedding services.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6">
          <p className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} WedBridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
