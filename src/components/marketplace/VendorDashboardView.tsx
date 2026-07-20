"use client";
import { useEffect, useState } from "react";
import { Store, Loader as Loader2, Package, Calendar, Star, IndianRupee } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getVendorByOwner } from "@/lib/marketplace/vendorService";
import { getVendorBookings } from "@/lib/marketplace/bookingService";
import { getPackages } from "@/lib/marketplace/packageService";
import type { VendorDocument, VendorBookingDocument, VendorPackageDocument } from "@/firebase/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

export function VendorDashboardView() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorDocument | null>(null);
  const [bookings, setBookings] = useState<VendorBookingDocument[]>([]);
  const [packages, setPackages] = useState<VendorPackageDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const v = await getVendorByOwner(user.uid);
      setVendor(v);
      if (v) { const [b, p] = await Promise.all([getVendorBookings(v.id), getPackages(v.id)]); setBookings(b); setPackages(p); }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="px-4 py-8"><div className="skeleton h-64 w-full rounded-2xl" /></div>;
  if (!vendor) return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center"><Store className="mx-auto h-12 w-12 text-primary-300" /><h1 className="heading-md mt-4">No Vendor Profile</h1><p className="text-lead mt-2 text-sm">You don&apos;t have a vendor profile yet.</p></div>
  );

  const revenue = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.amount, 0);
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="heading-md">{vendor.businessName}</h1><p className="text-lead mt-1 text-sm">Vendor Dashboard</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Revenue" value={formatCurrency(revenue)} color="text-green-600 bg-green-50" />
        <Stat icon={Calendar} label="Total Bookings" value={String(bookings.length)} color="text-blue-600 bg-blue-50" />
        <Stat icon={Package} label="Pending" value={String(pending)} color="text-amber-600 bg-amber-50" />
        <Stat icon={Star} label="Rating" value={vendor.rating.toFixed(1)} color="text-secondary-600 bg-secondary-50" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6"><h2 className="heading-sm">Recent Bookings</h2>{bookings.length === 0 ? <p className="mt-3 text-sm text-muted">No bookings yet.</p> : <div className="mt-3 space-y-2">{bookings.slice(0, 5).map((b) => <div key={b.id} className="flex items-center justify-between border-b border-primary-50 pb-2"><div><p className="text-sm font-medium text-primary-900">{b.userName}</p><p className="text-xs text-muted">{formatDate(b.preferredDate as unknown as string)}</p></div><p className="text-sm font-semibold">{formatCurrency(b.amount)}</p></div>)}</div>}</div>
        <div className="card p-6"><h2 className="heading-sm">Packages</h2>{packages.length === 0 ? <p className="mt-3 text-sm text-muted">No packages yet.</p> : <div className="mt-3 space-y-2">{packages.map((p) => <div key={p.id} className="flex items-center justify-between border-b border-primary-50 pb-2"><div><p className="text-sm font-medium text-primary-900">{p.name}</p><p className="text-xs text-muted">{p.description}</p></div><p className="text-sm font-semibold">{formatCurrency(p.price)}</p></div>)}</div>}</div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return <div className="card p-5"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><p className="mt-3 font-display text-2xl font-bold text-primary-900">{value}</p><p className="text-sm text-muted">{label}</p></div>;
}
