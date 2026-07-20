import Link from "next/link";

export default function DashboardPage() {
  return (
    <div style={{ padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#731e36", fontFamily: "Georgia, serif" }}>Dashboard</h1>
      <p style={{ marginTop: 8, color: "#6b7280" }}>Welcome to your WedBridge dashboard.</p>
      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
        <Link href="/search" style={{ padding: 24, borderRadius: 12, background: "white", border: "1px solid #fce4e8", textDecoration: "none", color: "#731e36", fontWeight: 600 }}>Search Profiles</Link>
        <Link href="/profile" style={{ padding: 24, borderRadius: 12, background: "white", border: "1px solid #fce4e8", textDecoration: "none", color: "#731e36", fontWeight: 600 }}>My Profile</Link>
        <Link href="/services" style={{ padding: 24, borderRadius: 12, background: "white", border: "1px solid #fce4e8", textDecoration: "none", color: "#731e36", fontWeight: 600 }}>Wedding Services</Link>
      </div>
    </div>
  );
}
