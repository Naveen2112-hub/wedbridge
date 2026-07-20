"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) router.push("/admin");
    else setError(res.error ?? "Login failed");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#1a1a1a" }}>
      <div style={{ background: "white", padding: 40, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", maxWidth: 400, width: "100%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", fontFamily: "Georgia, serif" }}>Admin Login</h1>
        <p style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>WedBridge Administration</p>
        {error && <p style={{ marginTop: 16, color: "#dc2626", fontSize: 14 }}>{error}</p>}
        <form onSubmit={submit} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="email" placeholder="Admin Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }} />
          <button type="submit" disabled={loading} style={{ padding: "12px", borderRadius: 8, background: "#1a1a1a", color: "white", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "#6b7280" }}>
          <Link href="/" style={{ color: "#1a1a1a", fontWeight: 600 }}>Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
