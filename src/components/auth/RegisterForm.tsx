"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, User, Loader as Loader2, Eye, EyeOff, CircleCheck as CheckCircle2 } from "lucide-react";
import { registerUser } from "@/lib/auth/authService";
import { useAuth } from "@/lib/auth/AuthProvider";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useToast } from "@/components/ui/Toast";
import { validateEmail, sanitizeText } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginWithGoogle, profileCompleted } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const google = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast("Account created! Welcome to WedBridge", "success");
      router.push(profileCompleted ? "/dashboard" : "/complete-profile");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Google sign-in failed", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sanitizeText(name).length < 2) { toast("Please enter your name", "error"); return; }
    if (!validateEmail(email)) { toast("Please enter a valid email", "error"); return; }
    if (password.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    if (password !== confirm) { toast("Passwords do not match", "error"); return; }
    if (!agreed) { toast("Please accept the terms", "error"); return; }
    setLoading(true);
    const res = await registerUser(email, password, sanitizeText(name));
    setLoading(false);
    if (res.ok) { toast("Account created! Welcome to WedBridge", "success"); router.push("/profile/edit"); }
    else toast(res.error ?? "Registration failed", "error");
  };

  return (
    <div className="card p-8">
      <div className="text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white"><Heart className="h-7 w-7" /></span><h1 className="heading-md mt-4">Create Account</h1><p className="text-lead mt-2 text-sm">Start your journey to finding the perfect match</p></div>
      <div className="mt-6">
        <GoogleButton onClick={google} loading={googleLoading} label="Continue with Google" />
        <div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-primary-100" /><span className="text-xs text-gray-500">or</span><div className="h-px flex-1 bg-primary-100" /></div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="name">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input id="name" type="text" required autoComplete="name" className="input pl-10" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" /></div></div>
        <div><label className="label" htmlFor="reg-email">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input id="reg-email" type="email" required autoComplete="email" className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div></div>
        <div><label className="label" htmlFor="reg-password">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input id="reg-password" type={showPass ? "text" : "password"} required autoComplete="new-password" className="input pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" aria-label={showPass ? "Hide password" : "Show password"}>{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        <div><label className="label" htmlFor="confirm">Confirm Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input id="confirm" type={showPass ? "text" : "password"} required autoComplete="new-password" className="input pl-10" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" /></div></div>
        <label className="flex items-start gap-2 text-sm text-gray-500"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded border-primary-300 text-primary-600 focus:ring-primary-500" />I agree to the Terms &amp; Conditions and Privacy Policy</label>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" />Create Account</>}</button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">Already have an account? <Link href="/login" className="font-semibold text-primary-700 hover:underline">Login</Link></p>
    </div>
  );
}
