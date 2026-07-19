"use client";
import Link from "next/link";
import { CircleAlert as AlertCircle } from "lucide-react";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (<div className="flex min-h-[60vh] items-center justify-center bg-grain"><div className="mx-auto max-w-md px-6 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700"><AlertCircle className="h-7 w-7" /></span><h1 className="heading-md mt-5">Something went wrong</h1><p className="text-lead mt-2">An unexpected error occurred. Please try again.</p><div className="mt-6 flex items-center justify-center gap-3"><button type="button" onClick={reset} className="btn-primary">Try again</button><Link href="/" className="btn-outline">Back home</Link></div></div></div>);
}
