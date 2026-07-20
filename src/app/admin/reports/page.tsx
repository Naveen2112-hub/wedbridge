"use client";
import { useEffect, useState } from "react";
import { ChartBar as FileBarChart, IndianRupee, Users, Heart } from "lucide-react";
import { getReport, type ReportRow } from "@/lib/admin/analyticsService";
import { cn } from "@/lib/cn";

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); getReport(period).then((r) => { setRows(r); setLoading(false); }); }, [period]);

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const maxRev = Math.max(...rows.map((r) => r.revenue), 1);

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Reports</h1><p className="text-lead mt-1 text-sm">Daily, weekly, monthly and yearly revenue reports.</p></div>

      <div className="flex gap-2">
        {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
          <button key={p} type="button" onClick={() => setPeriod(p)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium capitalize transition", period === p ? "bg-primary-600 text-white" : "bg-white text-muted ring-1 ring-primary-100 hover:text-primary-700")}>{p}</button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100"><div className="flex items-center gap-2 text-muted"><IndianRupee className="h-4 w-4" /><span className="text-sm">Total Revenue</span></div><p className="mt-2 font-display text-2xl font-bold text-primary-900">₹{totalRevenue.toLocaleString()}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100"><div className="flex items-center gap-2 text-muted"><FileBarChart className="h-4 w-4" /><span className="text-sm">Period</span></div><p className="mt-2 font-display text-2xl font-bold text-primary-900 capitalize">{period}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100"><div className="flex items-center gap-2 text-muted"><Heart className="h-4 w-4" /><span className="text-sm">Records</span></div><p className="mt-2 font-display text-2xl font-bold text-primary-900">{rows.length}</p></div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100">
        <h2 className="heading-sm">Revenue Breakdown</h2>
        {loading ? <div className="mt-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-8 w-full rounded-lg" />)}</div> :
        rows.length === 0 ? <p className="mt-4 text-sm text-muted">No data for this period.</p> :
        <div className="mt-4 space-y-3">
          {rows.map((r) => (
            <div key={r.date} className="flex items-center gap-3">
              <span className="w-32 flex-none text-xs text-muted">{r.date}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-primary-50"><div className="h-full rounded-lg bg-primary-500 transition-all" style={{ width: `${(r.revenue / maxRev) * 100}%` }} /></div>
              <span className="w-24 flex-none text-right text-sm font-semibold text-primary-900">₹{r.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}
