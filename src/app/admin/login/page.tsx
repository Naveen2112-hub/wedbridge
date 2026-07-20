"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { Shield, Mail, Lock, Loader as Loader2 } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-primary-950 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-900 text-white shadow-lg">
              <Shield className="h-7 w-7" />
            </span>
            <h1 className="heading-md mt-4">Admin Login</h1>
            <p className="text-lead mt-2 text-sm">WedBridge Administration Portal</p>
          </div>
          {error && <div className="mt-6 rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">{error}</div>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="admin-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="admin@wedbridge.com" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="admin-pass">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input id="admin-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500"><Link href="/" className="font-semibold text-primary-600 hover:underline">Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}
