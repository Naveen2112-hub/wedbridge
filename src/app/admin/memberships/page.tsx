"use client";
import { useEffect, useState } from "react";
import { Crown, TrendingUp, CreditCard, RefreshCw, Users } from "lucide-react";
import { AdminPage } from "@/components/auth/AdminPage";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { listAllSubscriptions } from "@/lib/membership/membershipService";
import { listAllPayments, getRevenueStats, type RevenueStats } from "@/lib/membership/paymentService";
import type { SubscriptionDocument, PaymentDocument, MembershipTier } from "@/firebase/schema";
import { cn } from "@/lib/cn";

const planStyles: Record<string, string> = { free: "bg-primary-50 text-primary-800", basic: "bg-blue-50 text-blue-700", premium: "bg-secondary-100 text-secondary-800", gold: "bg-amber-100 text-amber-800" };
const statusStyles: Record<string, string> = { pending: "bg-amber-50 text-amber-700", paid: "bg-green-50 text-green-700", verified: "bg-green-50 text-green-700", failed: "bg-red-50 text-red-700", cancelled: "bg-gray-100 text-gray-500", refunded: "bg-purple-50 text-purple-700", expired: "bg-gray-100 text-gray-500" };

export default function AdminMembershipsPage() {
  const { t } = useLanguage();
  const [subs, setSubs] = useState<SubscriptionDocument[]>([]);
  const [payments, setPayments] = useState<PaymentDocument[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, p, r] = await Promise.all([listAllSubscriptions(100), listAllPayments(100), getRevenueStats()]);
      setSubs(s); setPayments(p); setStats(r); setLoading(false);
    })();
  }, []);

  return (
    <AdminPage title="Memberships" description="Manage subscriptions, payments, and revenue." icon={Crown}>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString()}`} color="text-green-600" />
            <StatCard icon={CreditCard} label="Paid Payments" value={String(stats?.paidCount ?? 0)} color="text-blue-600" />
            <StatCard icon={RefreshCw} label="Pending" value={String(stats?.pendingCount ?? 0)} color="text-amber-600" />
            <StatCard icon={Users} label="Active Subs" value={String(subs.filter((s) => s.status === "active").length)} color="text-secondary-600" />
          </div>

          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-primary-900">Recent Subscriptions</h2>
            <div className="overflow-x-auto rounded-2xl bg-white shadow-md">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-primary-50 text-left text-gray-500"><th className="p-3">User</th><th className="p-3">Plan</th><th className="p-3">Status</th><th className="p-3">Expiry</th></tr></thead>
                <tbody>
                  {subs.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">No subscriptions yet.</td></tr> :
                  subs.map((s) => (
                    <tr key={s.id} className="border-b border-primary-50 last:border-0">
                      <td className="p-3 font-mono text-xs">{s.uid.slice(0, 8)}…</td>
                      <td className="p-3"><span className={cn("badge", planStyles[s.plan])}>{s.plan}</span></td>
                      <td className="p-3"><span className={cn("badge", s.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>{s.status}</span></td>
                      <td className="p-3 text-xs text-gray-500">{s.endDate ? new Date(s.endDate as unknown as number).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-primary-900">Payment History & Transaction Details</h2>
            <div className="overflow-x-auto rounded-2xl bg-white shadow-md">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-primary-50 text-left text-gray-500"><th className="p-3">Order ID</th><th className="p-3">Payment ID</th><th className="p-3">Plan</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
                <tbody>
                  {payments.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">No payments yet.</td></tr> :
                  payments.map((p) => (
                    <tr key={p.id} className="border-b border-primary-50 last:border-0">
                      <td className="p-3 font-mono text-xs">{(p.orderId ?? p.razorpayOrderId ?? "").slice(0, 16)}…</td>
                      <td className="p-3 font-mono text-xs">{(p.gatewayPaymentId ?? p.razorpayPaymentId ?? "").slice(0, 16)}…</td>
                      <td className="p-3"><span className={cn("badge", planStyles[p.plan])}>{p.plan}</span></td>
                      <td className="p-3">₹{(p.amount / 100).toLocaleString()}</td>
                      <td className="p-3"><span className={cn("badge", statusStyles[p.status])}>{p.status}</span></td>
                      <td className="p-3 text-xs text-gray-500">{p.createdAt ? new Date(p.createdAt as string).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-primary-900">Revenue by Plan</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(stats?.byPlan ?? {}).map(([plan, amount]) => (
                <div key={plan} className="rounded-xl border border-primary-50 p-4"><p className={cn("badge mb-1", planStyles[plan])}>{plan}</p><p className="font-display text-xl font-bold text-primary-900">₹{amount.toLocaleString()}</p></div>
              ))}
              {Object.keys(stats?.byPlan ?? {}).length === 0 && <p className="text-sm text-gray-500">No revenue data yet.</p>}
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-center gap-3"><span className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50", color)}><Icon className="h-5 w-5" /></span><p className="text-sm text-gray-500">{label}</p></div>
      <p className="mt-3 font-display text-2xl font-bold text-primary-900">{value}</p>
    </div>
  );
}
