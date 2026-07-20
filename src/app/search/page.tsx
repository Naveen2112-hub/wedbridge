import Link from "next/link";

export default function SearchPage() {
  return (
    <div style={{ padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#731e36", fontFamily: "Georgia, serif" }}>Search Profiles</h1>
      <p style={{ marginTop: 8, color: "#6b7280" }}>Find your perfect match.</p>
      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input type="text" placeholder="Search by name, profession, or location" style={{ flex: 1, minWidth: 250, padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }} />
        <button style={{ padding: "12px 24px", borderRadius: 8, background: "#a51d3c", color: "white", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Search</button>
      </div>
      <p style={{ marginTop: 32, color: "#6b7280", fontSize: 14 }}>
        <Link href="/" style={{ color: "#a51d3c", fontWeight: 600 }}>Back to Home</Link>
      </p>
    </div>
  );
}
