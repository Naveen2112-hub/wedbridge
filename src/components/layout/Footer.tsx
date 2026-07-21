"use client";
import Link from "next/link";
import { Heart, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Lock } from "lucide-react";
import { useState } from "react";

const cols = [
  { title: "Matrimony", links: [{ href: "/search", label: "Find Matches" }, { href: "/matches", label: "AI Matches" }, { href: "/membership", label: "Membership" }, { href: "/register", label: "Register" }] },
  { title: "Marketplace", links: [{ href: "/services", label: "Wedding Services" }, { href: "/vendor-dashboard", label: "Vendor Dashboard" }, { href: "/my-bookings", label: "My Bookings" }] },
  { title: "Account", links: [{ href: "/profile", label: "My Profile" }, { href: "/notifications", label: "Notifications" }, { href: "/settings", label: "Settings" }, { href: "/login", label: "Login" }] },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (e: React.FormEvent) => { e.preventDefault(); if (email) { setSubscribed(true); setEmail(""); } };

  return (
    <footer className="relative mt-20 border-t border-primary-100/80 bg-gradient-to-b from-primary-50/30 to-primary-50/60">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold text-primary-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm shadow-sm">
                <Heart className="h-5 w-5 text-white" fill="currentColor" />
              </span>
              WedBridge
            </Link>
            <p className="mt-4 max-w-sm text-sm text-gray-500">Tamil Nadu&apos;s premier matrimony platform. Find your perfect match with AI-powered matchmaking and premium wedding services.</p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social media" className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-200/60 bg-white text-primary-600 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-primary-600 hover:text-white hover:shadow-md">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gray-900">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 transition-colors hover:text-primary-700">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gray-900">Stay Updated</h3>
            <p className="mt-4 text-sm text-gray-500">Get matchmaking tips and exclusive offers.</p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="input flex-1 text-sm" aria-label="Email for newsletter" />
              <button type="submit" className="btn-primary text-sm">{subscribed ? "Subscribed!" : "Subscribe"}</button>
            </form>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary-500" /> support@wedbridge.com</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary-500" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-500" /> Chennai, Tamil Nadu</div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-100 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} WedBridge. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-primary-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary-700">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-primary-700">Cookie Policy</Link>
          </div>
        </div>

        {/* Admin Login */}
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-primary-100/60 pt-6 text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Administrator</span>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200/70 bg-white px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800 hover:shadow"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
