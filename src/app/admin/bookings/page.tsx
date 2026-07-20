"use client";
import { useEffect, useState } from "react";
import { listAllBookings } from "@/lib/marketplace/bookingService";
import type { VendorBookingDocument } from "@/firebase/schema";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<VendorBookingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listAllBookings(500).then((b) => { setBookings(b); setLoading(false); }); }, []);

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Bookings</h1><p className="text-lead mt-1 text-sm">All wedding vendor bookings across the platform.</p></div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-primary-100 text-left text-muted"><th className="p-3">Vendor</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Guests</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {bookings.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-muted">No bookings found.</td></tr> :
            bookings.map((b) => (
              <tr key={b.id} className="border-b border-primary-100 last:border-0">
                <td className="p-3 font-medium text-primary-900">{b.vendorName}</td>
                <td className="p-3 text-xs">{b.userName}</td>
                <td className="p-3 text-xs">{formatDate(b.preferredDate as unknown as string)}</td>
                <td className="p-3 text-xs">{b.guestCount}</td>
                <td className="p-3 font-medium">{formatCurrency(b.amount)}</td>
                <td className="p-3"><span className={cn("badge", b.status === "completed" ? "bg-green-50 text-green-700" : b.status === "confirmed" ? "bg-blue-50 text-blue-700" : b.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
