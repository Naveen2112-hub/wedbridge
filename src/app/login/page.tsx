import Link from "next/link";

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", padding: 40, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxWidth: 400, width: "100%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#731e36", fontFamily: "Georgia, serif" }}>Sign In</h1>
        <p style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>Welcome back to WedBridge</p>
        <form style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="email" placeholder="Email" style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }} />
          <input type="password" placeholder="Password" style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }} />
          <button type="submit" style={{ padding: "12px", borderRadius: 8, background: "#a51d3c", color: "white", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Sign In</button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "#6b7280" }}>
          Don&apos;t have an account? <Link href="/register" style={{ color: "#a51d3c", fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
