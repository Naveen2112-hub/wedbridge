import Link from "next/link";
import { Search, User, Store, Sparkles, Bell, Crown, Heart, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const cards = [
    { href: "/search", icon: Search, title: "Find Matches", desc: "Browse verified profiles", color: "bg-primary-50 text-primary-600" },
    { href: "/ai-matches", icon: Sparkles, title: "AI Matches", desc: "Smart compatibility scores", color: "bg-secondary-50 text-secondary-600" },
    { href: "/profile", icon: User, title: "My Profile", desc: "View and edit your profile", color: "bg-accent-50 text-accent-600" },
    { href: "/notifications", icon: Bell, title: "Notifications", desc: "Stay updated on activity", color: "bg-success-50 text-success-600" },
    { href: "/membership", icon: Crown, title: "Membership", desc: "Unlock premium features", color: "bg-warning-50 text-warning-600" },
    { href: "/services", icon: Store, title: "Wedding Services", desc: "Book trusted vendors", color: "bg-primary-50 text-primary-700" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="heading-md">Welcome to WedBridge</h1>
          <p className="text-lead mt-1">Your journey to finding the perfect match starts here.</p>
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card card-hover group p-6">
            <div className="flex items-start justify-between">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </span>
              <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
            </div>
            <h2 className="heading-sm mt-4">{c.title}</h2>
            <p className="text-body mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
