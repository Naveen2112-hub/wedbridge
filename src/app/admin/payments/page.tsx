"use client";
import { useEffect, useState } from "react";
import { Search, IndianRupee, CircleCheck as CheckCircle2, RotateCcw, Wallet } from "lucide-react";
import { listPayments, updatePayment } from "@/lib/admin/adminService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import type { AdminPayment } from "@/lib/admin/schema";
import { cn } from "@/lib/cn";

export default function AdminPaymentsPage() {
  const { adminUser } = useAdminAuth();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "refunded" | "failed">("all");
  const admin = adminUser ? { uid: adminUser.uid, email: adminUser.email } : undefined;

  useEffect(() => { listPayments(500).then((p) => { setPayments(p); setLoading(false); }); }, []);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const match = !q || p.userName?.toLowerCase().includes(q) || p.plan?.toLowerCase().includes(q);
    const f = filter === "all" ? true : p.status === filter;
    return match && f;
  });

  const totalRevenue = payments.filter((p) => p.status === "verified").reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="heading-md">Payments</h1><p className="text-lead mt-1 text-sm">Verify transactions and manage refunds.</p></div><div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100"><p className="text-xs text-muted">Total Revenue</p><p className="font-display text-xl font-bold text-green-700">₹{totalRevenue.toLocaleString()}</p></div></div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input className="input pl-10" placeholder="Search by user or plan…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="input max-w-[180px]" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="refunded">Refunded</option><option value="failed">Failed</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-primary-100 text-left text-muted"><th className="p-3">User</th><th className="p-3">Plan</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-muted">No payments found.</td></tr> :
            filtered.map((p) => (
              <tr key={p.id} className="border-b border-primary-100 last:border-0">
                <td className="p-3 font-medium text-primary-900">{p.userName}</td>
                <td className="p-3 text-xs">{p.plan}</td>
                <td className="p-3 font-medium">₹{p.amount.toLocaleString()}</td>
                <td className="p-3"><span className={cn("badge", p.status === "verified" ? "bg-green-50 text-green-700" : p.status === "pending" ? "bg-amber-50 text-amber-700" : p.status === "refunded" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700")}>{p.status}</span></td>
                <td className="p-3"><div className="flex gap-1">
                  {p.status === "pending" && <button type="button" onClick={() => updatePayment(p.id, { status: "verified" }, admin).then(() => setPayments((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "verified" } : x)))} className="rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100">Verify</button>}
                  {p.status === "verified" && <button type="button" onClick={() => updatePayment(p.id, { status: "refunded" }, admin).then(() => setPayments((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "refunded" } : x)))} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">Refund</button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
