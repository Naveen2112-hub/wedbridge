import Link from "next/link";
import { Heart, Mail, Phone, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-primary-100 bg-primary-900 text-primary-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <Heart className="h-5 w-5 text-secondary-400" fill="currentColor" />WedBridge
            </Link>
            <p className="mt-3 text-sm text-primary-200">Tamil Nadu&apos;s premier matrimony and wedding marketplace platform.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Matrimony</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-secondary-400">Find Matches</Link></li>
              <li><Link href="/matches" className="hover:text-secondary-400">AI Matching</Link></li>
              <li><Link href="/membership" className="hover:text-secondary-400">Membership</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Marketplace</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/services" className="hover:text-secondary-400">All Services</Link></li>
              <li><Link href="/vendor-dashboard" className="hover:text-secondary-400">Vendor Dashboard</Link></li>
              <li><Link href="/my-bookings" className="hover:text-secondary-400">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" />support@wedbridge.app</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Link href="#" aria-label="Facebook" className="rounded-lg bg-primary-800 p-2 hover:bg-primary-700"><Facebook className="h-4 w-4" /></Link>
              <Link href="#" aria-label="Instagram" className="rounded-lg bg-primary-800 p-2 hover:bg-primary-700"><Instagram className="h-4 w-4" /></Link>
              <Link href="#" aria-label="Twitter" className="rounded-lg bg-primary-800 p-2 hover:bg-primary-700"><Twitter className="h-4 w-4" /></Link>
              <Link href="#" aria-label="YouTube" className="rounded-lg bg-primary-800 p-2 hover:bg-primary-700"><Youtube className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-800 pt-6 text-center text-sm text-primary-300">
          <p>&copy; {new Date().getFullYear()} WedBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
