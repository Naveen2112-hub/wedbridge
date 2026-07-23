"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck as CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { PLANS, type Membership } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export default function SuccessPage() {
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getIdToken();
      if (!token) return;
      try {
        const res = await fetch("/api/membership/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMembership(data.membership ?? null);
        }
      } catch {
        // non-fatal
      }
    })();
  }, [getIdToken]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Loading…</p>
      </div>
    );
  }

  const plan = membership ? PLANS[membership.plan] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-neutral-900">
          Membership Activated Successfully
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Welcome to WedBridge {plan ? plan.name : ""}! Your membership is now active.
        </p>

        {membership && (
          <dl className="mt-6 space-y-3 rounded-xl bg-neutral-50 p-5 text-left text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Current Plan</dt>
              <dd className="font-medium text-neutral-900">{plan?.name ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Status</dt>
              <dd className="font-medium text-neutral-900">Active</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Expiry Date</dt>
              <dd className="font-medium text-neutral-900">{formatDate(membership.expiryDate)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Payment ID</dt>
              <dd className="font-mono text-xs break-all text-neutral-900">{membership.paymentId || "—"}</dd>
            </div>
          </dl>
        )}

        <button
          onClick={() => router.push("/membership")}
          className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          Back to membership <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
