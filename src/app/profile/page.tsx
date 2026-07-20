import Link from "next/link";

export default function ProfilePage() {
  return (
    <div style={{ padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#731e36", fontFamily: "Georgia, serif" }}>My Profile</h1>
      <p style={{ marginTop: 8, color: "#6b7280" }}>Manage your WedBridge profile.</p>
      <div style={{ marginTop: 24, background: "white", padding: 24, borderRadius: 12, border: "1px solid #fce4e8", maxWidth: 500 }}>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Profile details and settings will appear here.</p>
      </div>
      <p style={{ marginTop: 24, color: "#6b7280", fontSize: 14 }}>
        <Link href="/dashboard" style={{ color: "#a51d3c", fontWeight: 600 }}>Back to Dashboard</Link>
      </p>
    </div>
  );
}
