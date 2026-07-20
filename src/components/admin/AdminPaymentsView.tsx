"use client";
import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { listPayments } from "@/lib/admin/adminService";
import type { PaymentDocument } from "@/firebase/schema";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function AdminPaymentsView() {
  const [payments, setPayments] = useState<PaymentDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listPayments(200).then((p) => { setPayments(p); setLoading(false); }); }, []);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const successful = payments.filter((p) => p.status === "verified");

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Payments</h1><p className="text-lead mt-1 text-sm">View all payment transactions</p></div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><CreditCard className="h-8 w-8 text-primary-600" /><p className="mt-2 font-display text-2xl font-bold text-primary-900">{payments.length}</p><p className="text-sm text-muted">Total Transactions</p></div>
        <div className="card p-5"><CreditCard className="h-8 w-8 text-green-600" /><p className="mt-2 font-display text-2xl font-bold text-primary-900">{successful.length}</p><p className="text-sm text-muted">Verified</p></div>
        <div className="card p-5"><CreditCard className="h-8 w-8 text-secondary-600" /><p className="mt-2 font-display text-2xl font-bold text-primary-900">{formatCurrency(total)}</p><p className="text-sm text-muted">Total Amount</p></div>
      </div>
      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}</div> : (
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-primary-100 text-left text-xs text-muted"><th className="p-3">User</th><th className="p-3">Plan</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Payment ID</th></tr></thead>
          <tbody>{payments.map((p) => <tr key={p.id} className="border-b border-primary-50 hover:bg-primary-25"><td className="p-3 font-medium text-primary-900">{p.userName}</td><td className="p-3">{p.plan}</td><td className="p-3 font-semibold">{formatCurrency(p.amount)}</td><td className="p-3"><span className={cn("badge", p.status === "verified" ? "bg-green-50 text-green-700" : p.status === "failed" ? "bg-red-50 text-red-700" : p.status === "refunded" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>{p.status}</span></td><td className="p-3 text-muted">{formatDate(p.createdAt as unknown as string)}</td><td className="p-3 text-xs text-muted">{p.razorpayPaymentId ?? "—"}</td></tr>)}</tbody>
        </table></div></div>
      )}
    </div>
  );
}
