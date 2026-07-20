"use client";
import { useEffect, useState } from "react";
import { ChartBar as BarChart3, Calendar } from "lucide-react";
import { getReport, type ReportRow } from "@/lib/admin/analyticsService";
import { formatCurrency, formatDate } from "@/lib/utils";

const periods = [{ id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" }, { id: "yearly", label: "Yearly" }] as const;

export function AdminReportsView() {
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");

  useEffect(() => { setLoading(true); getReport(period).then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, [period]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Reports</h1><p className="text-lead mt-1 text-sm">Platform performance reports</p></div>
      <div className="mb-4 flex gap-2">{periods.map((p) => <button key={p.id} type="button" onClick={() => setPeriod(p.id)} className={`rounded-full px-4 py-2 text-sm font-medium ${period === p.id ? "bg-primary-700 text-white" : "bg-white text-muted ring-1 ring-primary-100"}`}>{p.label}</button>)}</div>
      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}</div> : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="card p-5"><BarChart3 className="h-6 w-6 text-primary-600" /><p className="mt-2 font-display text-2xl font-bold text-primary-900">{data.length}</p><p className="text-sm text-muted">Periods</p></div>
            <div className="card p-5"><BarChart3 className="h-6 w-6 text-green-600" /><p className="mt-2 font-display text-2xl font-bold text-primary-900">{formatCurrency(totalRevenue)}</p><p className="text-sm text-muted">Total Revenue</p></div>
            <div className="card p-5"><BarChart3 className="h-6 w-6 text-blue-600" /><p className="mt-2 font-display text-2xl font-bold text-primary-900">{data.reduce((s, d) => s + d.users, 0)}</p><p className="text-sm text-muted">Total Users</p></div>
          </div>
          <div className="card p-6"><h2 className="heading-sm">Breakdown</h2><div className="mt-3 space-y-2">{data.length === 0 ? <p className="text-sm text-muted">No data for this period.</p> : data.map((d) => <div key={d.date} className="flex items-center justify-between border-b border-primary-50 py-2"><div className="flex items-center gap-2 text-sm text-muted"><Calendar className="h-4 w-4" />{d.date}</div><div className="flex gap-4 text-sm"><span>{d.users} users</span><span>{d.interests} interests</span><span className="font-semibold">{formatCurrency(d.revenue)}</span></div></div>)}</div></div>
        </>
      )}
    </div>
  );
}
