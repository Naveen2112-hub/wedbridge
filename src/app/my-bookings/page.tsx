"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CircleCheck as CheckCircle2, Clock, Circle as XCircle, ArrowRight, Heart } from "lucide-react";
import { getUserBookings } from "@/lib/marketplace/bookingService";
import type { VendorBookingDocument, BookingStatus } from "@/firebase/schema";
import { cn } from "@/lib/cn";

const statusStyles: Record<BookingStatus, { badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { badge: "bg-amber-50 text-amber-700", icon: Clock },
  confirmed: { badge: "bg-blue-50 text-blue-700", icon: CheckCircle2 },
  completed: { badge: "bg-green-50 text-green-700", icon: CheckCircle2 },
  cancelled: { badge: "bg-red-50 text-red-700", icon: XCircle },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<VendorBookingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");

  useEffect(() => {
    getUserBookings("guest").then((b) => { setBookings(b); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="heading-lg">My Bookings</h1><p className="text-lead mt-2">Track your vendor bookings and history.</p></div>
        <Link href="/services" className="btn-primary">Browse Vendors <ArrowRight className="h-4 w-4" /></Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={cn("rounded-full px-3 py-1.5 text-sm font-medium capitalize transition", filter === s ? "bg-primary-600 text-white" : "bg-white text-muted ring-1 ring-primary-100 hover:text-primary-700")}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 w-full rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-primary-100">
          <Calendar className="mx-auto h-10 w-10 text-primary-300" />
          <p className="mt-3 font-medium text-primary-900">No bookings yet</p>
          <p className="text-sm text-muted">Browse vendors and book your favorites.</p>
          <Link href="/services" className="btn-primary mt-4">Find Vendors</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((b) => {
            const S = statusStyles[b.status];
            const Icon = S.icon;
            return (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100">
                <div>
                  <Link href={`/vendor/${b.vendorId}`} className="font-display text-base font-semibold text-primary-900 hover:text-primary-700">{b.vendorName}</Link>
                  <p className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.preferredDate ? new Date(b.preferredDate as unknown as string).toLocaleDateString() : "—"}</span>
                    <span>{b.time}</span>
                    <span>· {b.guestCount} guests</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary-900">₹{b.amount.toLocaleString()}</span>
                  <span className={cn("badge", S.badge)}><Icon className="h-3.5 w-3.5" />{b.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10">
        <h2 className="heading-sm flex items-center gap-2"><Heart className="h-5 w-5 text-secondary-500" />Favourite Vendors</h2>
        <p className="mt-2 text-sm text-muted">Your saved vendors will appear here.</p>
      </div>
    </div>
  );
}
