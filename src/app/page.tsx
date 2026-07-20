"use client";
import Link from "next/link";
import { Heart, Sparkles, ShieldCheck, Search, Store, Crown, ArrowRight, BadgeCheck, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #d68a14 1px, transparent 1px), radial-gradient(circle at 80% 20%, #d68a14 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-secondary-200 ring-1 ring-white/20"><Sparkles className="h-3 w-3" />AI-Powered Matrimony</span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Find Your Perfect Match in <span className="text-secondary-400">Tamil Nadu</span></h1>
            <p className="mt-6 text-lg text-primary-100">WedBridge connects you with verified profiles using our AI compatibility algorithm. Plus, discover trusted wedding vendors all in one place.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-secondary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-secondary-600"><Heart className="h-4 w-4" />Start Free Today</Link>
              <Link href="/search" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20"><Search className="h-4 w-4" />Browse Profiles</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-primary-100">
              <span className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-secondary-400" />Verified Profiles</span>
              <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-secondary-400" />AI Matching</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-secondary-400" />Secure & Private</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center"><h2 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">Why Choose WedBridge?</h2><p className="mt-3 text-base text-muted">Everything you need for your matrimony journey</p></div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Sparkles, title: "AI Matchmaking", desc: "Our intelligent algorithm considers religion, caste, language, location, and more to find your most compatible matches.", color: "text-secondary-600 bg-secondary-50" },
            { icon: BadgeCheck, title: "Verified Profiles", desc: "Every profile is verified to ensure authenticity. Look for the verified badge for trusted connections.", color: "text-green-600 bg-green-50" },
            { icon: ShieldCheck, title: "Privacy First", desc: "Your data is protected with industry-standard security. Control who sees your contact information.", color: "text-blue-600 bg-blue-50" },
            { icon: Store, title: "Wedding Marketplace", desc: "Find trusted vendors for every wedding need - from halls to photographers, catering, and more.", color: "text-purple-600 bg-purple-50" },
            { icon: Crown, title: "Premium Membership", desc: "Unlock unlimited interests, advanced filters, and priority support with our Premium and Gold plans.", color: "text-amber-600 bg-amber-50" },
            { icon: Users, title: "Community Trust", desc: "Join thousands of Tamil Nadu families who trust WedBridge for their matrimony journey.", color: "text-primary-600 bg-primary-50" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100 transition hover:shadow-md">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}><f.icon className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display text-xl font-semibold text-primary-900">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-900 p-8 text-center text-white shadow-sm sm:p-12">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to Find Your Match?</h2>
          <p className="mt-4 text-primary-100">Join WedBridge today and start your journey towards a beautiful future together.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-secondary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-secondary-600">Create Free Account</Link><Link href="/membership" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20">View Plans</Link></div>
        </div>
      </section>
    </div>
  );
}
