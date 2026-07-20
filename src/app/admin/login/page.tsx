"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, Loader as Loader2, ArrowLeft } from "lucide-react";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) router.push("/admin");
    else setError(res.error ?? "Login failed");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-primary-100">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white"><ShieldCheck className="h-7 w-7" /></span>
            <h1 className="heading-md mt-4">Admin Login</h1>
            <p className="text-lead mt-2 text-sm">Sign in with an admin account to access the panel.</p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><label className="label" htmlFor="admin-email">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input id="admin-email" type="email" required autoComplete="email" className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@wedbridge.com" /></div></div>
            <div><label className="label" htmlFor="admin-pass">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input id="admin-pass" type="password" required autoComplete="current-password" className="input pl-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div></div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}</button>
          </form>
          <button type="button" onClick={() => router.push("/")} className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-muted hover:text-primary-700"><ArrowLeft className="h-3 w-3" />Back to site</button>
        </div>
      </div>
    </div>
  );
}
