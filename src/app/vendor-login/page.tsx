"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Mail, Lock, Loader as Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";

export default function VendorLoginPage() {
  const router = useRouter();
  const { loginWithEmail } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast("Welcome back! Redirecting to vendor dashboard...", "success");
      router.push("/vendor-dashboard");
    } catch {
      toast("Login failed. Check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
              <Store className="h-7 w-7 text-rose-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-neutral-900">Vendor Login</h1>
            <p className="mt-1 text-sm text-neutral-500">Sign in to manage your vendor business</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In as Vendor"}
            </button>
          </form>
          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-neutral-500">
              Are you a vendor?{" "}
              <Link href="/vendor/create" className="font-semibold text-rose-600 hover:underline">
                Create vendor profile
              </Link>
            </p>
            <Link href="/login" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600">
              <ArrowLeft className="h-3 w-3" /> Back to user login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
