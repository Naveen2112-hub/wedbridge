"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Loader as Loader2, ArrowLeft, CircleCheck as CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/lib/auth/authService";
import { useToast } from "@/components/ui/Toast";
import { validateEmail } from "@/lib/utils";

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { toast("Please enter a valid email", "error"); return; }
    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.ok) { setSent(true); toast("Reset link sent to your email", "success"); }
    else toast(res.error ?? "Failed to send reset link", "error");
  };

  if (sent) return (
    <div className="card p-8 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600"><CheckCircle2 className="h-7 w-7" /></span><h1 className="heading-md mt-4">Check Your Email</h1><p className="text-lead mt-2 text-sm">We&apos;ve sent a password reset link to <strong>{email}</strong></p><Link href="/login" className="btn-primary mt-6">Back to Login</Link></div>
  );

  return (
    <div className="card p-8">
      <h1 className="heading-md">Forgot Password</h1>
      <p className="text-lead mt-2 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label className="label" htmlFor="fp-email">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input id="fp-email" type="email" required className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div></div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}</button>
      </form>
      <Link href="/login" className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-primary-700"><ArrowLeft className="h-3 w-3" />Back to login</Link>
    </div>
  );
}
