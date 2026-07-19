export default function Loading() {
  return (<div className="flex min-h-[60vh] items-center justify-center bg-grain"><div className="flex flex-col items-center gap-4"><span className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-800" /><p className="text-sm text-muted">Loading…</p></div></div>);
}
