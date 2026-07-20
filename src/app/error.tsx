"use client";
import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert as AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-50 px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <h1 className="heading-lg mt-4">Something went wrong</h1>
      <p className="text-lead mt-2 max-w-md">An unexpected error occurred. Please try again or return home.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try Again</button>
        <Link href="/" className="btn-outline">Back to Home</Link>
      </div>
    </div>
  );
}
