"use client";
import { useEffect, useState } from "react";
import { Activity, AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { getErrorSummary, getRecentErrors, clearErrorBuffer, type FirebaseErrorEvent } from "@/lib/monitoring/firebaseMonitor";

export default function MonitoringPage() {
  const [summary, setSummary] = useState<{ total: number; byCategory: Record<string, number>; topErrors: { key: string; count: number }[] } | null>(null);
  const [errors, setErrors] = useState<FirebaseErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); setSummary(getErrorSummary()); setErrors(getRecentErrors()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const categoryColors: Record<string, string> = { network: "text-amber-600 bg-amber-50", permission: "text-red-600 bg-red-50", quota: "text-orange-600 bg-orange-50", "not-found": "text-blue-600 bg-blue-50", validation: "text-purple-600 bg-purple-50", unknown: "text-gray-600 bg-gray-50" };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="heading-md flex items-center gap-2"><Activity className="h-6 w-6 text-primary-700" />Firebase Monitoring</h1>
          <p className="text-lead mt-1 text-sm">Real-time Firebase error tracking and health monitoring.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
          <button type="button" onClick={() => { clearErrorBuffer(); load(); }} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Clear</button>
        </div>
      </div>
      {loading ? <div className="skeleton h-64 w-full rounded-2xl" /> : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-5"><div className="flex items-center gap-2 text-sm text-gray-500"><ShieldCheck className="h-4 w-4" />Total Errors</div><p className="mt-2 font-display text-2xl font-bold text-primary-900">{summary?.total ?? 0}</p></div>
            {Object.entries(summary?.byCategory ?? {}).map(([cat, count]) => <div key={cat} className="card p-5"><div className={`flex items-center gap-2 text-sm ${categoryColors[cat] ?? "text-gray-600"}`}><AlertTriangle className="h-4 w-4" />{cat}</div><p className="mt-2 font-display text-2xl font-bold text-primary-900">{count}</p></div>)}
          </div>
          {summary && summary.topErrors.length > 0 && (
            <div className="card mb-6 p-6">
              <h2 className="heading-sm mb-4">Top Recurring Errors</h2>
              <div className="space-y-2">
                {summary.topErrors.map((err) => <div key={err.key} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2"><span className="text-sm font-mono text-gray-700">{err.key}</span><span className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600">{err.count}x</span></div>)}
              </div>
            </div>
          )}
          <div className="card p-6">
            <h2 className="heading-sm mb-4">Recent Error Events</h2>
            {errors.length === 0 ? <p className="text-sm text-gray-500">No errors recorded. Firebase is operating normally.</p> : (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {errors.map((err, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-lg px-2 py-1 text-xs font-medium ${categoryColors[err.code.split("/")[0] ?? "unknown"] ?? categoryColors.unknown}`}>{err.code}</span>
                      <span className="text-xs text-gray-400">{new Date(err.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{err.message}</p>
                    <p className="mt-1 text-xs text-gray-500">Operation: {err.operation}{err.collection ? ` | Collection: ${err.collection}` : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
