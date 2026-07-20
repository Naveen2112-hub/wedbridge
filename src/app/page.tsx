import Link from "next/link";
import { Heart, Sparkles, ShieldCheck, Search, Store, Users, ArrowRight, Star, CircleCheck as CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { VENDOR_CATEGORIES } from "@/firebase/schema";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  return (
    <AppShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-50">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1600')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="badge bg-secondary-100 text-secondary-800"><Sparkles className="h-3.5 w-3.5" />AI-Powered Matching</span>
            <h1 className="heading-lg mt-4">Find Your Perfect Life Partner in Tamil Nadu</h1>
            <p className="text-lead mt-4 text-lg">Join thousands of families who found their perfect match through WedBridge. AI-powered compatibility matching, verified profiles, and a trusted community.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary text-base">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/search" className="btn-outline text-base">Browse Profiles</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-600" />Verified Profiles</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary-600" />50,000+ Members</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-secondary-500" />4.8 Rating</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center"><h2 className="heading-md">Everything for Your Wedding</h2><p className="text-lead mt-2">From finding your partner to planning the perfect wedding</p></div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard icon={Search} title="Smart Search" desc="Filter by religion, caste, city, education and more to find your ideal match." />
          <FeatureCard icon={Sparkles} title="AI Matching" desc="Our AI algorithm finds the most compatible profiles based on your preferences." />
          <FeatureCard icon={Store} title="Wedding Marketplace" desc="Book trusted vendors for every wedding need - all in one place." />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center"><h2 className="heading-md">Wedding Services Marketplace</h2><p className="text-lead mt-2">20+ categories of trusted wedding vendors</p></div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {VENDOR_CATEGORIES.slice(0, 10).map((cat) => (
              <Link key={cat.id} href={`/services/${cat.id}`} className="group rounded-2xl bg-primary-50 p-5 text-center transition hover:bg-primary-100 hover:shadow-md">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-200 text-primary-800 transition group-hover:scale-110"><Heart className="h-5 w-5" /></div>
                <p className="mt-3 text-sm font-semibold text-primary-900">{cat.name}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center"><Link href="/services" className="btn-outline">View All Categories <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-center text-white sm:p-12">
          <h2 className="font-display text-3xl font-bold">Ready to Find Your Match?</h2>
          <p className="mt-3 text-primary-100">Join WedBridge today and start your journey.</p>
          <Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50">Create Free Account <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </AppShell>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="card p-6 transition hover:shadow-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><Icon className="h-6 w-6" /></span>
      <h3 className="mt-4 font-display text-lg font-semibold text-primary-900">{title}</h3>
      <p className="mt-2 text-sm text-muted">{desc}</p>
    </div>
  );
}
