"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="flex min-h-[60vh] items-center justify-center bg-grain px-4"><div className="max-w-md text-center"><h2 className="heading-md">Something went wrong</h2><p className="text-lead mt-2">{error.message}</p><button onClick={reset} className="btn-primary mt-6">Try again</button></div></div>;
}
