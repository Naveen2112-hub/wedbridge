"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Store, Loader as Loader2, Package, Calendar, Star, IndianRupee, Image as ImageIcon, BarChart3, Settings, MessageSquare, TrendingUp, CircleCheck as CheckCircle, Plus, CreditCard as Edit, Save } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getVendorByOwner, updateVendor } from "@/lib/marketplace/vendorService";
import { getVendorBookings } from "@/lib/marketplace/bookingService";
import { getPackages, getGallery } from "@/lib/marketplace/packageService";
import { getReviews } from "@/lib/marketplace/reviewService";
import type { VendorDocument, VendorBookingDocument, VendorPackageDocument, VendorGalleryDocument, VendorReviewDocument } from "@/firebase/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type Tab = "overview" | "bookings" | "gallery" | "packages" | "reviews" | "analytics" | "settings";

export function VendorDashboardView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorDocument | null>(null);
  const [bookings, setBookings] = useState<VendorBookingDocument[]>([]);
  const [packages, setPackages] = useState<VendorPackageDocument[]>([]);
  const [gallery, setGallery] = useState<VendorGalleryDocument[]>([]);
  const [reviews, setReviews] = useState<VendorReviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ about: "", phone: "", email: "", city: "", startingPrice: 0, experienceYears: 0 });

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const v = await getVendorByOwner(user.uid);
      setVendor(v);
      if (v) {
        setEditForm({ about: v.about, phone: v.phone, email: v.email, city: v.city, startingPrice: v.startingPrice, experienceYears: v.experienceYears });
        const [b, p, g, r] = await Promise.all([getVendorBookings(v.id), getPackages(v.id), getGallery(v.id), getReviews(v.id)]);
        setBookings(b); setPackages(p); setGallery(g); setReviews(r);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!vendor) return;
    try {
      await updateVendor(vendor.id, { about: editForm.about, phone: editForm.phone, email: editForm.email, city: editForm.city, startingPrice: Number(editForm.startingPrice), experienceYears: Number(editForm.experienceYears) });
      setVendor({ ...vendor, ...editForm, startingPrice: Number(editForm.startingPrice), experienceYears: Number(editForm.experienceYears) });
      setEditing(false);
      toast("Vendor profile updated successfully.", "success");
    } catch { toast("Failed to update vendor profile.", "error"); }
  };

  if (loading) return <div className="px-4 py-8"><div className="skeleton h-64 w-full rounded-2xl" /></div>;
  if (!vendor) return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <Store className="mx-auto h-12 w-12 text-neutral-300" />
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">No Vendor Profile</h1>
      <p className="mt-2 text-sm text-neutral-500">You don&apos;t have a vendor profile yet.</p>
      <a href="/vendor/create" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500"><Plus className="h-4 w-4" /> Create Vendor Profile</a>
    </div>
  );

  const revenue = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.amount, 0);
  const pending = bookings.filter((b) => b.status === "pending").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : vendor.rating.toFixed(1);

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: Store },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "packages", label: "Packages", icon: Package },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-900">{vendor.businessName}</h1><p className="mt-1 text-sm text-neutral-500">Vendor Dashboard</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${vendor.status === "approved" ? "bg-green-100 text-green-700" : vendor.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{vendor.status}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Revenue" value={formatCurrency(revenue)} color="text-green-600 bg-green-50" />
        <Stat icon={Calendar} label="Total Bookings" value={String(bookings.length)} color="text-blue-600 bg-blue-50" />
        <Stat icon={Package} label="Pending" value={String(pending)} color="text-amber-600 bg-amber-50" />
        <Stat icon={Star} label="Rating" value={avgRating} color="text-rose-600 bg-rose-50" />
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-neutral-200">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${tab === t.id ? "border-rose-600 text-rose-600" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}><t.icon className="h-4 w-4" /> {t.label}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Bookings</h2>
              {bookings.length === 0 ? <p className="mt-3 text-sm text-neutral-500">No bookings yet.</p> : (
                <div className="mt-3 space-y-2">{bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between border-b border-neutral-50 pb-2"><div><p className="text-sm font-medium text-neutral-900">{b.userName}</p><p className="text-xs text-neutral-500">{formatDate(b.preferredDate as unknown as string)}</p></div><p className="text-sm font-semibold">{formatCurrency(b.amount)}</p></div>
                ))}</div>
              )}
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Business Info</h2>
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="text-neutral-500">Category:</span> <span className="font-medium text-neutral-900">{vendor.category}</span></p>
                <p><span className="text-neutral-500">City:</span> <span className="font-medium text-neutral-900">{vendor.city}</span></p>
                <p><span className="text-neutral-500">Phone:</span> <span className="font-medium text-neutral-900">{vendor.phone}</span></p>
                <p><span className="text-neutral-500">Starting Price:</span> <span className="font-medium text-neutral-900">{formatCurrency(vendor.startingPrice)}</span></p>
                <p><span className="text-neutral-500">Experience:</span> <span className="font-medium text-neutral-900">{vendor.experienceYears} years</span></p>
                <p className="pt-2 text-neutral-600">{vendor.about}</p>
              </div>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">All Bookings</h2>
            {bookings.length === 0 ? <p className="mt-3 text-sm text-neutral-500">No bookings yet.</p> : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-neutral-100 text-left text-xs text-neutral-500"><th className="pb-2">Customer</th><th className="pb-2">Date</th><th className="pb-2">Guests</th><th className="pb-2">Amount</th><th className="pb-2">Status</th></tr></thead>
                  <tbody>{bookings.map((b) => (
                    <tr key={b.id} className="border-b border-neutral-50"><td className="py-2 font-medium text-neutral-900">{b.userName}</td><td className="py-2 text-neutral-500">{formatDate(b.preferredDate as unknown as string)}</td><td className="py-2 text-neutral-500">{b.guestCount}</td><td className="py-2 font-semibold">{formatCurrency(b.amount)}</td><td className="py-2"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.status === "completed" ? "bg-green-100 text-green-700" : b.status === "pending" ? "bg-amber-100 text-amber-700" : b.status === "confirmed" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{b.status}</span></td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "gallery" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-neutral-900">Gallery</h2><button className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"><Plus className="h-3.5 w-3.5" /> Add Image</button></div>
            {gallery.length === 0 ? <div className="mt-6 flex flex-col items-center py-12 text-center"><ImageIcon className="h-12 w-12 text-neutral-300" /><p className="mt-3 text-sm text-neutral-500">No gallery images yet.</p><p className="mt-1 text-xs text-neutral-400">Upload images to showcase your work.</p></div> :
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{gallery.map((g) => <div key={g.id} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">{g.imageURL && <Image src={g.imageURL} alt={g.caption ?? ""} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />}</div>)}</div>}
          </div>
        )}

        {tab === "packages" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-neutral-900">Pricing & Packages</h2><button className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"><Plus className="h-3.5 w-3.5" /> Add Package</button></div>
            {packages.length === 0 ? <div className="mt-6 flex flex-col items-center py-12 text-center"><Package className="h-12 w-12 text-neutral-300" /><p className="mt-3 text-sm text-neutral-500">No packages yet.</p><p className="mt-1 text-xs text-neutral-400">Create packages to offer your services.</p></div> :
              <div className="mt-4 grid gap-4 sm:grid-cols-2">{packages.map((p) => (
                <div key={p.id} className="rounded-xl border border-neutral-200 p-5"><h3 className="font-semibold text-neutral-900">{p.name}</h3><p className="mt-1 text-sm text-neutral-500">{p.description}</p><p className="mt-2 text-lg font-bold text-rose-600">{formatCurrency(p.price)}</p>{p.inclusions && p.inclusions.length > 0 && <ul className="mt-3 space-y-1">{p.inclusions.map((inc, i) => <li key={i} className="flex items-center gap-1.5 text-xs text-neutral-600"><CheckCircle className="h-3 w-3 text-green-500" /> {inc}</li>)}</ul>}</div>
              ))}</div>}
          </div>
        )}

        {tab === "reviews" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Customer Reviews</h2>
            {reviews.length === 0 ? <div className="mt-6 flex flex-col items-center py-12 text-center"><MessageSquare className="h-12 w-12 text-neutral-300" /><p className="mt-3 text-sm text-neutral-500">No reviews yet.</p></div> :
              <div className="mt-4 space-y-4">{reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-neutral-100 p-4"><div className="flex items-center justify-between"><p className="font-medium text-neutral-900">{r.userName}</p><div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-amber-400" : "text-neutral-200"}`} fill={i < r.rating ? "currentColor" : "none"} />)}</div></div><p className="mt-2 text-sm text-neutral-600">{r.review}</p>{r.verifiedBooking && <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3 w-3" /> Verified booking</span>}</div>
              ))}</div>}
          </div>
        )}

        {tab === "analytics" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900"><TrendingUp className="h-5 w-5 text-rose-600" /> Booking Stats</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2"><span className="text-sm text-neutral-500">Total Bookings</span><span className="font-bold text-neutral-900">{bookings.length}</span></div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2"><span className="text-sm text-neutral-500">Completed</span><span className="font-bold text-green-600">{completed}</span></div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2"><span className="text-sm text-neutral-500">Pending</span><span className="font-bold text-amber-600">{pending}</span></div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2"><span className="text-sm text-neutral-500">Total Revenue</span><span className="font-bold text-neutral-900">{formatCurrency(revenue)}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Avg Rating</span><span className="font-bold text-neutral-900">{avgRating} / 5</span></div>
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900"><BarChart3 className="h-5 w-5 text-blue-600" /> Profile Performance</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2"><span className="text-sm text-neutral-500">Review Count</span><span className="font-bold text-neutral-900">{reviews.length}</span></div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2"><span className="text-sm text-neutral-500">Gallery Images</span><span className="font-bold text-neutral-900">{gallery.length}</span></div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2"><span className="text-sm text-neutral-500">Packages</span><span className="font-bold text-neutral-900">{packages.length}</span></div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2"><span className="text-sm text-neutral-500">Featured</span><span className="font-bold text-neutral-900">{vendor.featured ? "Yes" : "No"}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Verification</span><span className="font-bold text-neutral-900">{vendor.verificationStatus}</span></div>
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Vendor Settings</h2>
              {!editing ? <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"><Edit className="h-3.5 w-3.5" /> Edit</button> :
                <button onClick={handleSave} className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"><Save className="h-3.5 w-3.5" /> Save</button>}
            </div>
            <div className="mt-4 space-y-4">
              <div><label className="mb-1 block text-sm font-medium text-neutral-700">About</label><textarea rows={3} disabled={!editing} value={editForm.about} onChange={(e) => setEditForm({ ...editForm, about: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none disabled:bg-neutral-50" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-sm font-medium text-neutral-700">Phone</label><input type="tel" disabled={!editing} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none disabled:bg-neutral-50" /></div>
                <div><label className="mb-1 block text-sm font-medium text-neutral-700">Email</label><input type="email" disabled={!editing} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none disabled:bg-neutral-50" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-sm font-medium text-neutral-700">City</label><input type="text" disabled={!editing} value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none disabled:bg-neutral-50" /></div>
                <div><label className="mb-1 block text-sm font-medium text-neutral-700">Starting Price (Rs.)</label><input type="number" disabled={!editing} value={editForm.startingPrice} onChange={(e) => setEditForm({ ...editForm, startingPrice: Number(e.target.value) })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none disabled:bg-neutral-50" /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-neutral-700">Years of Experience</label><input type="number" disabled={!editing} value={editForm.experienceYears} onChange={(e) => setEditForm({ ...editForm, experienceYears: Number(e.target.value) })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none disabled:bg-neutral-50" /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return <div className="rounded-2xl border border-neutral-200 bg-white p-5"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><p className="mt-3 text-2xl font-bold text-neutral-900">{value}</p><p className="text-sm text-neutral-500">{label}</p></div>;
}
