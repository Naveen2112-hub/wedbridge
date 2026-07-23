"use client";

import Link from "next/link";
import { XCircle, ArrowRight, RotateCcw } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-9 w-9 text-red-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-neutral-900">Payment Failed</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Your payment could not be processed. This may be due to insufficient funds,
          an expired card, or a network issue. No amount has been charged.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/membership"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Back to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-6 text-xs text-neutral-400">
          Need help? Contact us at support@wedbridge.in or +91 63831 09341
        </p>
      </div>
    </div>
  );
}
