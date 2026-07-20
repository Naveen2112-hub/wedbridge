"use client";
import { useEffect, useState } from "react";
import { Calendar, Loader as Loader2, Package } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getUserBookings } from "@/lib/marketplace/bookingService";
import type { VendorBookingDocument } from "@/firebase/schema";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function MyBookingsView() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<VendorBookingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const b = await getUserBookings(user.uid);
      setBookings(b); setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="px-4 py-8"><div className="skeleton h-32 w-full rounded-2xl" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="heading-md flex items-center gap-2"><Calendar className="h-6 w-6 text-primary-600" />My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-12 text-center text-gray-500"><Package className="mx-auto h-10 w-10 text-primary-300" /><p className="mt-3">No bookings yet.</p></div>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card flex items-center justify-between p-4">
              <div><h3 className="font-semibold text-primary-900">{b.vendorName}</h3><p className="text-xs text-gray-500">{formatDate(b.preferredDate as unknown as string)} · {b.time} · {b.guestCount} guests</p>{b.specialNotes && <p className="mt-1 text-sm text-gray-500">&ldquo;{b.specialNotes}&rdquo;</p>}</div>
              <div className="text-right"><p className="font-bold text-primary-900">{formatCurrency(b.amount)}</p><span className={cn("badge mt-1", b.status === "confirmed" ? "bg-green-50 text-green-700" : b.status === "cancelled" ? "bg-red-50 text-red-700" : b.status === "completed" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>{b.status}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
