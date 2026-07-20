"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Loader as Loader2, Eye, EyeOff } from "lucide-react";
import { loginUser, loginWithGoogle } from "@/lib/auth/authService";
import { useToast } from "@/components/ui/Toast";
import { validateEmail } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { toast("Please enter a valid email", "error"); return; }
    if (password.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);
    if (res.ok) { toast("Welcome back!", "success"); router.push("/search"); }
    else toast(res.error ?? "Login failed", "error");
  };

  const google = async () => {
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.ok) { toast("Welcome back!", "success"); router.push("/search"); }
    else toast(res.error ?? "Google login failed", "error");
  };

  return (
    <div className="card p-8">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white"><Heart className="h-7 w-7" /></span>
        <h1 className="heading-md mt-4">Welcome Back</h1>
        <p className="text-lead mt-2 text-sm">Sign in to continue your journey</p>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label className="label" htmlFor="email">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input id="email" type="email" required autoComplete="email" className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div></div>
        <div><label className="label" htmlFor="password">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input id="password" type={showPass ? "text" : "password"} required autoComplete="current-password" className="input pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={showPass ? "Hide password" : "Show password"}>{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}</button>
      </form>
      <div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-primary-100" /><span className="text-xs text-muted">or</span><div className="h-px flex-1 bg-primary-100" /></div>
      <button type="button" onClick={google} disabled={googleLoading} className="btn-outline w-full">{googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue with Google"}</button>
      <p className="mt-4 text-center text-sm text-muted">Don&apos;t have an account? <Link href="/register" className="font-semibold text-primary-700 hover:underline">Register</Link></p>
      <p className="mt-2 text-center text-sm text-muted"><Link href="/forgot-password" className="font-medium text-primary-600 hover:underline">Forgot password?</Link></p>
    </div>
  );
}
