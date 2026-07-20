"use client";
import { useEffect, useState } from "react";
import { listAllBookings } from "@/lib/marketplace/bookingService";
import type { VendorBookingDocument } from "@/firebase/schema";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function AdminBookingsView() {
  const [bookings, setBookings] = useState<VendorBookingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listAllBookings(200).then((b: VendorBookingDocument[]) => { setBookings(b); setLoading(false); }); }, []);

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Bookings</h1><p className="text-lead mt-1 text-sm">View all vendor bookings</p></div>
      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}</div> : (
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-primary-100 text-left text-xs text-gray-500"><th className="p-3">Vendor</th><th className="p-3">User</th><th className="p-3">Date</th><th className="p-3">Guests</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
          <tbody>{bookings.map((b: VendorBookingDocument) => <tr key={b.id} className="border-b border-primary-50 hover:bg-primary-25"><td className="p-3 font-medium text-primary-900">{b.vendorName}</td><td className="p-3">{b.userName}</td><td className="p-3 text-gray-500">{formatDate(b.preferredDate as unknown as string)}</td><td className="p-3">{b.guestCount}</td><td className="p-3 font-semibold">{formatCurrency(b.amount)}</td><td className="p-3"><span className={cn("badge", b.status === "confirmed" ? "bg-green-50 text-green-700" : b.status === "cancelled" ? "bg-red-50 text-red-700" : b.status === "completed" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>{b.status}</span></td></tr>)}</tbody>
        </table></div></div>
      )}
    </div>
  );
}
