"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Store, ArrowRight, BadgeCheck, Star, Heart, Sparkles } from "lucide-react";
import { VENDOR_CATEGORIES } from "@/firebase/schema";
import { getFeaturedVendors } from "@/lib/marketplace/vendorService";
import { VendorCard } from "@/components/marketplace/VendorCard";
import type { VendorDocument } from "@/firebase/schema";

export default function HomePage() {
  const [featured, setFeatured] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getFeaturedVendors(6).then((v) => { setFeatured(v); setLoading(false); }); }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-secondary-800 backdrop-blur"><Sparkles className="h-3.5 w-3.5" />Wedding Marketplace</span>
            <h1 className="heading-lg mt-4 text-4xl sm:text-5xl lg:text-6xl">Find trusted vendors for your perfect wedding</h1>
            <p className="text-lead mt-4 text-lg">From marriage halls to mehendi artists, book verified vendors across 20+ categories.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="btn-primary text-base">Browse Services <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/vendor-dashboard" className="btn-outline text-base">List Your Business</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div><h2 className="heading-md">Wedding Services</h2><p className="text-lead mt-2">Explore vendors by category</p></div>
          <Link href="/services" className="btn-ghost text-sm">View All Services <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {VENDOR_CATEGORIES.slice(0, 10).map((cat) => (
            <Link key={cat.id} href={`/services/${cat.id}`} className="group flex flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-primary-100 transition hover:shadow-md hover:ring-primary-300">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition group-hover:bg-secondary-100 group-hover:text-secondary-700"><span className="font-bold">{cat.name[0]}</span></span>
              <p className="text-xs font-semibold text-primary-900">{cat.name}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/services" className="btn-outline text-sm">View All Services <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="bg-primary-50/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div><h2 className="heading-md flex items-center gap-2"><Star className="h-6 w-6 text-secondary-500" />Featured Vendors</h2><p className="text-lead mt-2">Top-rated, verified vendors for your special day</p></div>
            <Link href="/services" className="btn-ghost text-sm">View All <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {loading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-80 w-full rounded-2xl" />)}</div>
          ) : featured.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-primary-100">
              <Store className="mx-auto h-10 w-10 text-primary-300" />
              <p className="mt-3 font-medium text-primary-900">Featured vendors coming soon</p>
              <p className="text-sm text-muted">Vendors will appear here once approved and featured by admins.</p>
              <Link href="/services" className="btn-primary mt-4">Browse All Vendors</Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((v) => <VendorCard key={v.id} vendor={v} />)}</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[{ icon: BadgeCheck, title: "Verified Vendors", desc: "Every vendor is verified for trust and quality" }, { icon: Heart, title: "Easy Booking", desc: "Book your favorite vendors in just a few clicks" }, { icon: Star, title: "Real Reviews", desc: "Read authentic reviews from verified bookings" }].map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-primary-100">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700"><f.icon className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display text-lg font-semibold text-primary-900">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
