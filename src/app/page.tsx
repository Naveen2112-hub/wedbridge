import Link from "next/link";
import { Heart, Sparkles, ShieldCheck, Search, Store, Crown, BadgeCheck, Users } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: Sparkles, title: "AI Matchmaking", desc: "Intelligent algorithm for compatible matches.", color: "#d68a14", bg: "#fdfaef" },
    { icon: BadgeCheck, title: "Verified Profiles", desc: "Every profile verified for authenticity.", color: "#16a34a", bg: "#f0fdf4" },
    { icon: ShieldCheck, title: "Privacy First", desc: "Your data protected with industry security.", color: "#2563eb", bg: "#eff6ff" },
    { icon: Store, title: "Wedding Marketplace", desc: "Trusted vendors for every wedding need.", color: "#9333ea", bg: "#faf5ff" },
    { icon: Crown, title: "Premium Membership", desc: "Unlock unlimited interests and advanced filters.", color: "#d97706", bg: "#fffbeb" },
    { icon: Users, title: "Community Trust", desc: "Join thousands of Tamil Nadu families.", color: "#a51d3c", bg: "#fdf2f4" },
  ];

  return (
    <div>
      <section style={{ background: "linear-gradient(135deg, #a51d3c, #881c38, #731e36)", color: "white", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 999, background: "rgba(255,255,255,0.1)", fontSize: 12, fontWeight: 600, color: "#f0d98e", border: "1px solid rgba(255,255,255,0.2)" }}>
            <Sparkles size={12} /> AI-Powered Matrimony
          </span>
          <h1 style={{ fontSize: 48, fontWeight: 700, marginTop: 16, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>
            Find Your Perfect Match in <span style={{ color: "#e0a832" }}>Tamil Nadu</span>
          </h1>
          <p style={{ fontSize: 18, marginTop: 24, color: "#fce4e8", maxWidth: 600 }}>
            WedBridge connects you with verified profiles using our AI compatibility algorithm. Plus, discover trusted wedding vendors all in one place.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "#d68a14", color: "white", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              <Heart size={16} /> Start Free Today
            </Link>
            <Link href="/search" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600, fontSize: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Search size={16} /> Browse Profiles
            </Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", fontFamily: "Georgia, serif", color: "#731e36" }}>
          Why Choose WedBridge?
        </h2>
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #fce4e8" }}>
              <span style={{ display: "flex", width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, background: f.bg, color: f.color }}>
                <f.icon size={24} />
              </span>
              <h3 style={{ marginTop: 16, fontSize: 20, fontWeight: 600, fontFamily: "Georgia, serif", color: "#731e36" }}>{f.title}</h3>
              <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ background: "linear-gradient(135deg, #a51d3c, #731e36)", borderRadius: 16, padding: 48, textAlign: "center", color: "white" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "Georgia, serif" }}>Ready to Find Your Match?</h2>
          <p style={{ marginTop: 16, color: "#fce4e8" }}>Join WedBridge today and start your journey towards a beautiful future together.</p>
          <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "#d68a14", color: "white", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Create Free Account
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600, fontSize: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
