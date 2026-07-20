"use client";
import { useEffect, useState } from "react";
import { Store, ChartBar as BarChart3, IndianRupee, CircleCheck as CheckCircle2, Circle as XCircle, Star, ShieldCheck, Sparkles } from "lucide-react";
import { listAllVendors, updateVendor } from "@/lib/marketplace/vendorService";
import { listAllBookings } from "@/lib/marketplace/bookingService";
import type { VendorDocument, VendorBookingDocument, VendorStatus, VerificationStatus } from "@/firebase/schema";
import { getCategoryName } from "@/firebase/schema";
import { cn } from "@/lib/cn";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [bookings, setBookings] = useState<VendorBookingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { setVendors(await listAllVendors(200)); setBookings(await listAllBookings(200)); setLoading(false); })();
  }, []);

  const revenue = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.amount, 0);
  const pending = vendors.filter((v) => v.status === "pending");
  const approved = vendors.filter((v) => v.status === "approved");

  const setStatus = async (id: string, status: VendorStatus) => { await updateVendor(id, { status }); setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status } : v)); };
  const setVerified = async (id: string, verificationStatus: VerificationStatus) => { await updateVendor(id, { verificationStatus }); setVendors((prev) => prev.map((v) => v.id === id ? { ...v, verificationStatus } : v)); };
  const setFeatured = async (id: string, featured: boolean) => { await updateVendor(id, { featured }); setVendors((prev) => prev.map((v) => v.id === id ? { ...v, featured } : v)); };

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-10"><div className="skeleton h-96 w-full rounded-2xl" /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div><h1 className="heading-lg flex items-center gap-2"><Store className="h-7 w-7 text-primary-600" />Vendor Management</h1><p className="text-lead mt-2">Approve, verify, and manage wedding vendors.</p></div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Store} label="Total Vendors" value={String(vendors.length)} color="text-primary-600" />
        <Stat icon={ShieldCheck} label="Pending Approval" value={String(pending.length)} color="text-amber-600" />
        <Stat icon={CheckCircle2} label="Approved" value={String(approved.length)} color="text-green-600" />
        <Stat icon={IndianRupee} label="Revenue" value={`₹${revenue.toLocaleString()}`} color="text-secondary-600" />
      </div>

      <div className="mt-8">
        <h2 className="heading-sm">Vendor Approval & Verification</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-primary-100 text-left text-muted"><th className="p-3">Business</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Verified</th><th className="p-3">Featured</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {vendors.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-muted">No vendors registered yet.</td></tr> :
              vendors.map((v) => (
                <tr key={v.id} className="border-b border-primary-100 last:border-0">
                  <td className="p-3"><p className="font-medium text-primary-900">{v.businessName}</p><p className="text-xs text-muted">{v.city}, {v.state}</p></td>
                  <td className="p-3 text-xs">{getCategoryName(v.category)}</td>
                  <td className="p-3"><span className={cn("badge", v.status === "approved" ? "bg-green-50 text-green-700" : v.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>{v.status}</span></td>
                  <td className="p-3">{v.verificationStatus === "verified" ? <span className="badge bg-secondary-50 text-secondary-700">Verified</span> : <span className="text-xs text-muted">Unverified</span>}</td>
                  <td className="p-3">{v.featured ? <span className="badge bg-amber-50 text-amber-700">Featured</span> : <span className="text-xs text-muted">No</span>}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {v.status !== "approved" && <button type="button" onClick={() => setStatus(v.id, "approved")} className="rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100">Approve</button>}
                      {v.status !== "rejected" && <button type="button" onClick={() => setStatus(v.id, "rejected")} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">Reject</button>}
                      {v.verificationStatus !== "verified" && <button type="button" onClick={() => setVerified(v.id, "verified")} className="rounded-lg bg-secondary-50 px-2 py-1 text-xs font-medium text-secondary-700 hover:bg-secondary-100">Verify</button>}
                      <button type="button" onClick={() => setFeatured(v.id, !v.featured)} className={cn("rounded-lg px-2 py-1 text-xs font-medium", v.featured ? "bg-amber-50 text-amber-700" : "bg-primary-50 text-primary-700")}>{v.featured ? "Unfeature" : "Feature"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="heading-sm flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary-600" />Booking & Revenue Reports</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-primary-100 text-left text-muted"><th className="p-3">Vendor</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {bookings.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-muted">No bookings yet.</td></tr> :
              bookings.map((b) => (
                <tr key={b.id} className="border-b border-primary-100 last:border-0">
                  <td className="p-3 font-medium text-primary-900">{b.vendorName}</td>
                  <td className="p-3 text-xs">{b.userName}</td>
                  <td className="p-3 text-xs">{new Date(b.preferredDate as unknown as string).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">₹{b.amount.toLocaleString()}</td>
                  <td className="p-3"><span className={cn("badge", b.status === "completed" ? "bg-green-50 text-green-700" : b.status === "confirmed" ? "bg-blue-50 text-blue-700" : b.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100"><div className="flex items-center gap-3"><span className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50", color)}><Icon className="h-5 w-5" /></span><p className="text-sm text-muted">{label}</p></div><p className="mt-3 font-display text-2xl font-bold text-primary-900">{value}</p></div>;
}
