import Link from "next/link";
import { Heart, Sparkles, ShieldCheck, Search, Store, Crown, BadgeCheck, Users, ArrowRight, Star, Quote } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: Sparkles, title: "AI Matchmaking", desc: "Intelligent algorithm for compatible matches.", color: "text-secondary-600", bg: "bg-secondary-50" },
    { icon: BadgeCheck, title: "Verified Profiles", desc: "Every profile verified for authenticity.", color: "text-success-600", bg: "bg-success-50" },
    { icon: ShieldCheck, title: "Privacy First", desc: "Your data protected with industry security.", color: "text-primary-600", bg: "bg-primary-50" },
    { icon: Store, title: "Wedding Marketplace", desc: "Trusted vendors for every wedding need.", color: "text-accent-600", bg: "bg-accent-50" },
    { icon: Crown, title: "Premium Membership", desc: "Unlock unlimited interests and advanced filters.", color: "text-warning-600", bg: "bg-warning-50" },
    { icon: Users, title: "Community Trust", desc: "Join thousands of Tamil Nadu families.", color: "text-primary-700", bg: "bg-primary-50" },
  ];

  const stats = [
    { value: "50,000+", label: "Active Members" },
    { value: "12,000+", label: "Matches Made" },
    { value: "4.9/5", label: "User Rating" },
    { value: "500+", label: "Wedding Vendors" },
  ];

  const testimonials = [
    { name: "Priya & Karthik", location: "Chennai", text: "WedBridge helped us find each other through their AI matching. We connected instantly and got married within 6 months!" },
    { name: "Divya & Arun", location: "Coimbatore", text: "The verified profiles gave us confidence. The wedding marketplace made planning our wedding so much easier." },
    { name: "Lakshmi & Suresh", location: "Madurai", text: "Best matrimony platform in Tamil Nadu. The premium membership was worth every rupee for the quality of matches." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <div className="absolute inset-0 bg-hero-texture" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-primary-900/30 to-transparent" />
        <div className="container-page relative py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-secondary-200 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> AI-Powered Matrimony
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Perfect Match in <span className="text-secondary-300">Tamil Nadu</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-100/90">
              WedBridge connects you with verified profiles using our AI compatibility algorithm. Plus, discover trusted wedding vendors all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-secondary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-secondary-400 hover:shadow-lg">
                <Heart className="h-4 w-4" /> Start Free Today
              </Link>
              <Link href="/search" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                <Search className="h-4 w-4" /> Browse Profiles
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-primary-100/80">
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-success-400" /> 100% Verified</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary-400" /> Privacy Protected</div>
              <div className="flex items-center gap-2"><Star className="h-4 w-4 text-secondary-400" /> 4.9 Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-page -mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-primary-100/60 bg-white p-6 shadow-md sm:grid-cols-4 sm:p-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl font-bold text-primary-700 sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-gray-500 sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container-page section-pad">
        <div className="text-center">
          <h2 className="heading-lg">Why Choose WedBridge?</h2>
          <p className="text-lead mx-auto mt-3 max-w-2xl">Premium features designed to make your matrimony journey seamless and secure.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="heading-sm mt-4">{f.title}</h3>
              <p className="text-body mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-soft section-pad">
        <div className="container-page">
          <div className="text-center">
            <h2 className="heading-lg">Success Stories</h2>
            <p className="text-lead mx-auto mt-3 max-w-2xl">Real couples who found their perfect match on WedBridge.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card card-hover p-6">
                <Quote className="h-8 w-8 text-primary-200" />
                <p className="text-body mt-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-warm text-white font-semibold">{t.name[0]}</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page section-pad">
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
      </section>
    </div>
  );
}
