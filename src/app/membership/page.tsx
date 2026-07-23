"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Sparkles, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { useRazorpayCheckout } from "@/lib/razorpay-client";
import { PLANS, type Membership, type PlanId } from "@/lib/plans";
import { cn, formatDate } from "@/lib/utils";

export default function MembershipPage() {
  const { user, loading, getIdToken, logout } = useAuth();
  const { toast } = useToast();
  const { subscribe } = useRazorpayCheckout();
  const router = useRouter();

  const [membership, setMembership] = useState<Membership | null>(null);
  const [fetchingMembership, setFetchingMembership] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<PlanId | null>(null);

  const fetchMembership = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;
    setFetchingMembership(true);
    try {
      const res = await fetch("/api/membership/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembership(data.membership ?? null);
      }
    } catch {
      // non-fatal; current membership just won't display
    } finally {
      setFetchingMembership(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (user) fetchMembership();
  }, [user, fetchMembership]);

  async function handleSubscribe(planId: PlanId) {
    setProcessingPlan(planId);
    const success = await subscribe(planId);
    setProcessingPlan(null);
    if (success) {
      await fetchMembership();
      router.push("/membership/success");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return <SignInScreen />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-500" />
            <span className="text-lg font-semibold tracking-tight">WedBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-500 sm:inline">
              {user.email}
            </span>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Choose your membership
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-neutral-600">
            Unlock the full WedBridge experience. Activate instantly with
            Razorpay — no waiting, no approval needed.
          </p>
        </div>

        {membership && membership.status === "active" && (
          <CurrentMembershipCard membership={membership} />
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const plan = PLANS[id];
            const isProcessing = processingPlan === id;
            return (
              <div
                key={id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition hover:shadow-md",
                  plan.highlight
                    ? "border-gold-500 ring-1 ring-gold-500"
                    : "border-neutral-200",
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-white">
                    <Crown className="h-3.5 w-3.5" /> Most popular
                  </span>
                )}
                <h2 className="text-xl font-semibold text-neutral-900">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  {plan.description}
                </p>
                <p className="mt-4 text-4xl font-bold tracking-tight">
                  {plan.priceLabel}
                  <span className="text-base font-normal text-neutral-500">
                    {" "}
                    / year
                  </span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-neutral-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(id)}
                  disabled={isProcessing}
                  className={cn(
                    "mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
                    plan.highlight
                      ? "bg-gold-600 hover:bg-gold-500"
                      : "bg-brand-600 hover:bg-brand-500",
                  )}
                >
                  {isProcessing ? "Processing…" : `Subscribe to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function CurrentMembershipCard({ membership }: { membership: Membership }) {
  const plan = PLANS[membership.plan];
  return (
    <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
      <div className="flex items-center gap-2">
        <Check className="h-5 w-5 text-green-600" />
        <h2 className="text-lg font-semibold text-green-800">
          Active Membership
        </h2>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <Field label="Current Plan" value={plan.name} />
        <Field label="Status" value="Active" />
        <Field label="Expiry Date" value={formatDate(membership.expiryDate)} />
        <Field
          label="Payment ID"
          value={membership.paymentId || "—"}
          mono
        />
      </dl>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 font-medium text-neutral-900",
          mono && "font-mono text-xs break-all",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast("Signed in", "success");
      } else {
        await signUp(email, password);
        toast("Account created", "success");
      }
    } catch {
      toast(mode === "signin" ? "Sign in failed" : "Sign up failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-brand-500" />
          <span className="text-lg font-semibold tracking-tight">WedBridge</span>
        </div>
        <h1 className="text-xl font-semibold text-neutral-900">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Sign in to manage your membership.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-brand-600 hover:underline"
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
