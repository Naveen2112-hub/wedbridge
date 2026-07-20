"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader as Loader2, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { useToast } from "@/components/ui/Toast";
import { sanitizeText } from "@/lib/utils";

export function AdminLoginForm() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(sanitizeText(email), password);
    setLoading(false);
    if (res.ok) { toast("Welcome back, Admin!", "success"); router.push("/admin/dashboard"); }
    else toast(res.error ?? "Invalid admin credentials", "error");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-50 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white"><ShieldCheck className="h-7 w-7" /></span><h1 className="heading-md mt-4">Admin Login</h1><p className="text-lead mt-1 text-sm">Access the WedBridge admin panel</p></div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label">Admin Email</label><input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@wedbridge.com" /></div>
          <div><label className="label">Password</label><input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login as Admin"}</button>
        </form>
      </div>
    </div>
  );
}
