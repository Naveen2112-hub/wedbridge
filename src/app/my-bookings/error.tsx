"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold text-neutral-900">Something went wrong</h2>
      <p className="text-sm text-neutral-500">An unexpected error occurred while loading this page.</p>
      <button onClick={reset} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500">
        Try again
      </button>
    </div>
  );
}
