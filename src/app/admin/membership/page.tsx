"use client";
import { useEffect, useState } from "react";
import { Crown, Gem, Users } from "lucide-react";
import { listUsers } from "@/lib/admin/adminService";
import type { AdminUser } from "@/lib/admin/schema";

export default function AdminMembershipPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listUsers(500).then((u) => { setUsers(u); setLoading(false); }); }, []);

  const premium = users.filter((u) => u.membershipTier === "premium");
  const gold = users.filter((u) => u.membershipTier === "gold");
  const free = users.filter((u) => !u.membershipTier || u.membershipTier === "free");

  if (loading) return <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Membership</h1><p className="text-lead mt-1 text-sm">Overview of membership tiers across the platform.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TierCard icon={Users} label="Free Members" count={free.length} color="text-gray-600 bg-gray-50" />
        <TierCard icon={Crown} label="Premium Members" count={premium.length} color="text-secondary-600 bg-secondary-50" />
        <TierCard icon={Gem} label="Gold Members" count={gold.length} color="text-amber-600 bg-amber-50" />
      </div>
    </div>
  );
}

function TierCard({ icon: Icon, label, count, color }: { icon: React.ComponentType<{ className?: string }>; label: string; count: number; color: string }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><p className="mt-3 font-display text-2xl font-bold text-primary-900">{count}</p><p className="text-sm text-muted">{label}</p></div>;
}
