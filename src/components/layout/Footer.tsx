"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Shield,
  Store,
  User,
  Send,
} from "lucide-react";

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
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Membership", href: "/membership" },
      { label: "Marketplace", href: "/services" },
      { label: "Search", href: "/search" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
];

const loginLinks = [
  { label: "Admin Login", href: "/admin/login", icon: Shield },
  { label: "Vendor Login", href: "/vendor-login", icon: Store },
  { label: "User Login", href: "/login", icon: User },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-rose-500" fill="currentColor" />
              <span className="text-lg font-bold text-white">WedBridge</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-neutral-400">
              Tamil Nadu&apos;s premier matrimony platform. Find your perfect
              match with AI-powered matchmaking and premium wedding services.
            </p>
            <div className="mt-4 space-y-2">
              <a href="tel:+916383109341" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
                <Phone className="h-4 w-4" /> +91 63831 09341
              </a>
              <a href="mailto:support@wedbridge.in" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
                <Mail className="h-4 w-4" /> support@wedbridge.in
              </a>
              <p className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="h-4 w-4" /> Tamil Nadu, India
              </p>
            </div>
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

          <div>
            <h3 className="text-sm font-semibold text-white">Login Portals</h3>
            <ul className="mt-3 space-y-2">
              {loginLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-white">Download App</h3>
            <div className="mt-3 flex flex-col gap-2">
              <button className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-700">
                <span className="text-base">🍎</span> App Store
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-700">
                <span className="text-base">▶</span> Google Play
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500">Follow us:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-neutral-800 p-2 text-neutral-400 transition hover:bg-rose-600 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-sm items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Subscribe to newsletter"
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 border-t border-neutral-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-center text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} WedBridge. All rights reserved.
            </p>
            <p className="text-sm text-neutral-500">
              Made with <Heart className="inline h-3 w-3 text-rose-500" fill="currentColor" /> in Tamil Nadu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
