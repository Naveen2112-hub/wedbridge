"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart, Sparkles, ShieldCheck, Search, Store, Crown, BadgeCheck,
  Users, ArrowRight, Star, Quote, Lock, MessageCircle, Camera, Building2,
  Sparkle, Palette, Brush, UtensilsCrossed, Plane, Gem, BookOpen, Mail,
  Check, ChevronDown, Smartphone, Apple,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const heroTrust = [
  { icon: Sparkles, label: "AI Powered Matching" },
  { icon: BadgeCheck, label: "Verified Profiles" },
  { icon: ShieldCheck, label: "Privacy Protected" },
  { icon: Lock, label: "Secure Platform" },
];

const stats = [
  { value: "100,000+", label: "Verified Members" },
  { value: "20,000+", label: "Successful Matches" },
  { value: "98%", label: "Verified Profiles" },
  { value: "500+", label: "Wedding Vendors" },
];

const features = [
  { icon: Sparkles, title: "AI Matchmaking", desc: "Intelligent algorithm for compatible matches.", color: "text-secondary-600", bg: "bg-secondary-50" },
  { icon: BadgeCheck, title: "Verified Profiles", desc: "Every profile verified for authenticity.", color: "text-success-600", bg: "bg-success-50" },
  { icon: Lock, title: "Privacy Protection", desc: "Your data protected with industry security.", color: "text-primary-600", bg: "bg-primary-50" },
  { icon: MessageCircle, title: "Secure Messaging", desc: "Private conversations with encrypted chat.", color: "text-accent-600", bg: "bg-accent-50" },
  { icon: Store, title: "Wedding Marketplace", desc: "Trusted vendors for every wedding need.", color: "text-secondary-600", bg: "bg-secondary-50" },
  { icon: Search, title: "Advanced Search", desc: "Powerful filters to find your perfect match.", color: "text-primary-600", bg: "bg-primary-50" },
  { icon: Crown, title: "Premium Membership", desc: "Unlock unlimited interests and advanced filters.", color: "text-warning-600", bg: "bg-warning-50" },
  { icon: Users, title: "Community Trust", desc: "Join thousands of families across India.", color: "text-primary-700", bg: "bg-primary-50" },
];

const featuredProfiles = [
  { name: "Priya R.", age: 27, profession: "Software Engineer", education: "M.Tech", location: "Chennai", image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg" },
  { name: "Karthik S.", age: 29, profession: "Doctor", education: "MBBS, MD", location: "Coimbatore", image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg" },
  { name: "Divya M.", age: 25, profession: "Architect", education: "B.Arch", location: "Madurai", image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" },
  { name: "Arjun V.", age: 31, profession: "Business Analyst", education: "MBA", location: "Salem", image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg" },
];

const aiFactors = [
  { icon: Heart, label: "Lifestyle Match" },
  { icon: BadgeCheck, label: "Education Match" },
  { icon: Crown, label: "Career Match" },
  { icon: Sparkles, label: "Interest Match" },
  { icon: Users, label: "Family Preferences" },
  { icon: Star, label: "Horoscope Matching" },
];

const marketplaceCategories = [
  { icon: Camera, label: "Photography" },
  { icon: Building2, label: "Marriage Halls" },
  { icon: Palette, label: "Decoration" },
  { icon: Brush, label: "Makeup" },
  { icon: UtensilsCrossed, label: "Catering" },
  { icon: Plane, label: "Travel" },
  { icon: Gem, label: "Jewellery" },
  { icon: BookOpen, label: "Priests" },
  { icon: Mail, label: "Invitation Cards" },
];

const successStories = [
  { names: "Priya & Karthik", location: "Chennai", date: "December 2024", image: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg", quote: "WedBridge helped us find each other through their AI matching. We connected instantly and got married within 6 months!" },
  { names: "Divya & Arun", location: "Coimbatore", date: "November 2024", image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", quote: "The verified profiles gave us confidence. The wedding marketplace made planning our wedding so much easier." },
  { names: "Lakshmi & Suresh", location: "Madurai", date: "October 2024", image: "https://images.pexels.com/photos/1456626/pexels-photo-1456626.jpeg", quote: "Best matrimony platform in India. The premium membership was worth every rupee for the quality of matches." },
];

const faqs = [
  { q: "Is WedBridge free?", a: "Yes — registration, browsing, and AI matches are free. Premium unlocks unlimited interests and contact views." },
  { q: "How does verification work?", a: "Every profile is manually reviewed by our team. Verified profiles carry a badge." },
  { q: "Is my contact info private?", a: "Absolutely. Your contact details are only shared based on your privacy preference." },
  { q: "Which regions do you cover?", a: "We serve users across India, with 32+ cities and growing international support." },
];

const quickSearchFields = [
  { label: "Looking For", placeholder: "Bride or Groom" },
  { label: "Age", placeholder: "21 - 35" },
  { label: "Religion", placeholder: "Any" },
  { label: "Community", placeholder: "Any" },
  { label: "State", placeholder: "Tamil Nadu" },
  { label: "Education", placeholder: "Any" },
  { label: "Profession", placeholder: "Any" },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <div className="absolute inset-0 bg-hero-texture" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-primary-900/30 to-transparent" />
        <div className="container-page relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-secondary-200 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> AI-Powered Matrimony
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Perfect Life Partner
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-100/90">
              Join thousands of verified members using AI-powered matchmaking to discover meaningful relationships.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-secondary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-secondary-400">
                <Heart className="h-4 w-4" /> Start Free Today
              </Link>
              <Link href="/search" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <Search className="h-4 w-4" /> Browse Profiles
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
              {heroTrust.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-primary-100/80">
                  <item.icon className="h-4 w-4 text-secondary-300" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
            <Image src="https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg" alt="Wedding couple" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl bg-white/85 p-4 backdrop-blur-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
                <Heart className="h-5 w-5" fill="currentColor" />
              </span>
              <div>
                <p className="text-sm font-semibold text-primary-900">20,000+ matches made</p>
                <p className="text-xs text-gray-500">Across India & beyond</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Search */}
      <Section className="bg-primary-50/40">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-lg">Quick Search</h2>
          <p className="text-lead mt-3">Find your match in seconds with our powerful search.</p>
        </div>
        <Reveal>
          <div className="mt-10 rounded-3xl border border-primary-100/60 bg-white p-6 shadow-lg sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickSearchFields.map((field) => (
                <div key={field.label}>
                  <label className="label">{field.label}</label>
                  <select className="select" defaultValue="">
                    <option value="" disabled>{field.placeholder}</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Link href="/search" className="btn-primary">
                <Search className="h-4 w-4" /> Search
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Statistics */}
      <Section>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="rounded-2xl border border-primary-100/60 bg-white p-6 text-center shadow-md">
              <p className="font-display text-3xl font-bold text-primary-700 sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Why Choose WedBridge */}
      <Section className="bg-primary-50/30">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-lg">Why Choose WedBridge?</h2>
          <p className="text-lead mt-3">Premium features designed to make your matrimony journey seamless and secure.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-primary-100/60 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", f.bg, f.color)}>
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-primary-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Featured Profiles */}
      <Section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="heading-lg">Featured Profiles</h2>
            <p className="text-lead mt-3">Meet some of our verified members.</p>
          </div>
          <Link href="/search" className="hidden btn-outline sm:inline-flex">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProfiles.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div className="group overflow-hidden rounded-2xl border border-primary-100/60 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-primary-800 backdrop-blur">
                    <BadgeCheck className="h-3.5 w-3.5 text-secondary-600" /> Verified
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-display text-base font-semibold text-primary-900">{p.name}, {p.age}</p>
                  <p className="mt-1 text-xs text-gray-500">{p.profession}</p>
                  <p className="text-xs text-gray-500">{p.education}</p>
                  <p className="mt-1 text-xs text-gray-500">{p.location}</p>
                  <Link href="/search" className="btn-outline mt-4 w-full justify-center text-xs">
                    View Profile
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* AI Matching */}
      <Section className="bg-primary-50/30">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge-secondary"><Sparkles className="h-3.5 w-3.5" /> AI Compatibility Score</span>
          <h2 className="heading-lg mt-4">AI-Powered Matchmaking</h2>
          <p className="text-lead mt-3">Our AI learns your preferences and values to suggest matches that truly fit — not just on paper, but in life.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {aiFactors.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.06}>
              <div className="flex items-center gap-4 rounded-2xl border border-primary-100/60 bg-white p-5 shadow-md transition hover:shadow-lg">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-primary-900">{f.label}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-100">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${70 + i * 5}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/matches" className="btn-primary">
            Try AI Matching <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* Marketplace */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-lg">Wedding Marketplace</h2>
          <p className="text-lead mt-3">Everything you need for a beautiful wedding, all in one place.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {marketplaceCategories.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.05}>
              <Link href="/services" className="group flex items-center gap-4 rounded-2xl border border-primary-100/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary-300 hover:shadow-md">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-secondary-50 text-secondary-700 transition group-hover:bg-secondary-500 group-hover:text-white">
                  <c.icon className="h-6 w-6" />
                </span>
                <span className="font-display text-sm font-semibold text-primary-900">{c.label}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Success Stories */}
      <Section className="bg-primary-50/30">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-lg">Success Stories</h2>
          <p className="text-lead mt-3">Real couples who found their perfect match on WedBridge.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {successStories.map((s, i) => (
            <Reveal key={s.names} delay={i * 0.1}>
              <div className="overflow-hidden rounded-2xl border border-primary-100/60 bg-white shadow-md transition hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={s.image} alt={s.names} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-display text-lg font-semibold">{s.names}</p>
                    <p className="text-xs text-white/80">{s.location} · {s.date}</p>
                  </div>
                </div>
                <div className="p-6">
                  <Quote className="h-6 w-6 text-secondary-500" />
                  <p className="mt-3 text-sm text-gray-700">&ldquo;{s.quote}&rdquo;</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Download App */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-primary-950 p-10 text-center text-white shadow-lg sm:p-16">
          <div className="absolute inset-0 bg-hero-texture opacity-30" />
          <div className="relative">
            <Reveal>
              <h2 className="heading-lg text-white">Get the WedBridge App</h2>
              <p className="mt-3 text-white/70">Match on the go. Available on Android and iOS.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition hover:scale-[1.02]">
                  <Apple className="h-5 w-5" /> iOS
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                  <Smartphone className="h-5 w-5" /> Android
                </Link>
              </div>
              <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10">
                  <Smartphone className="h-8 w-8 text-white/70" />
                </div>
                <p className="text-xs text-white/60">Scan QR code to download</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="bg-primary-50/30">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-lg">Frequently Asked Questions</h2>
          <p className="text-lead mt-3">Everything you need to know.</p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-warm px-6 py-16 text-center text-white shadow-lg sm:px-12 lg:py-20">
          <div className="absolute inset-0 bg-hero-texture" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to Find Your Match?</h2>
            <p className="mx-auto mt-4 max-w-lg text-primary-100/90">Join WedBridge today and start your journey towards a beautiful future together.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-all duration-300 hover:scale-[1.02]">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-100/60 bg-white shadow-sm">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
          <span className="font-display text-base font-semibold text-primary-900">{q}</span>
          <ChevronDown className="h-5 w-5 flex-none text-gray-500 transition group-open:rotate-180" />
        </summary>
        <p className="px-5 pb-5 text-sm text-gray-500">{a}</p>
      </details>
    </div>
  );
}
