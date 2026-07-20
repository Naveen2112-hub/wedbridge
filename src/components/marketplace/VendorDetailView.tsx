"use client";
import { useEffect, useState, use } from "react";
import { Star, MapPin, BadgeCheck, Phone, Mail, Globe, Clock, Loader as Loader2, Calendar, Package, Image as ImageIcon, Heart } from "lucide-react";
import { getVendor, getPackages, getGallery, getReviews } from "@/lib/marketplace/vendorService";
import type { VendorDocument, VendorPackageDocument, VendorGalleryDocument, VendorReviewDocument } from "@/firebase/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { createBooking } from "@/lib/marketplace/bookingService";
import { useToast } from "@/components/ui/Toast";

export function VendorDetailView({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = use(idPromise);
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorDocument | null>(null);
  const [packages, setPackages] = useState<VendorPackageDocument[]>([]);
  const [gallery, setGallery] = useState<VendorGalleryDocument[]>([]);
  const [reviews, setReviews] = useState<VendorReviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"about" | "packages" | "gallery" | "reviews">("about");
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", guests: "100", notes: "", packageId: "" });

  useEffect(() => {
    (async () => {
      const [v, p, g, r] = await Promise.all([getVendor(id), getPackages(id), getGallery(id), getReviews(id)]);
      setVendor(v); setPackages(p); setGallery(g); setReviews(r); setLoading(false);
    })();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast("Please login to book", "error"); return; }
    if (!vendor) return;
    setBooking(true);
    try {
      const pkg = packages.find((p) => p.id === form.packageId);
      await createBooking({
        vendorId: vendor.id, vendorName: vendor.businessName, userId: user.uid, userName: user.displayName ?? "User", userEmail: user.email ?? "",
        packageId: form.packageId || undefined, preferredDate: form.date, time: form.time, guestCount: Number(form.guests), specialNotes: form.notes,
        amount: pkg?.price ?? vendor.startingPrice,
      });
      toast("Booking request sent!", "success");
      setForm({ date: "", time: "", guests: "100", notes: "", packageId: "" });
    } catch { toast("Booking failed", "error"); }
    setBooking(false);
  };

  if (loading) return <div className="px-4 py-8"><div className="skeleton h-96 w-full rounded-2xl" /></div>;
  if (!vendor) return <div className="px-4 py-16 text-center text-muted">Vendor not found.</div>;

  const tabs = [{ id: "about", label: "About", icon: Heart }, { id: "packages", label: "Packages", icon: Package }, { id: "gallery", label: "Gallery", icon: ImageIcon }, { id: "reviews", label: "Reviews", icon: Star }] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="card overflow-hidden">
        <div className="h-48 overflow-hidden bg-primary-100">{vendor.coverURL && <img src={vendor.coverURL} alt={vendor.businessName} className="h-full w-full object-cover" />}</div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2"><h1 className="heading-md">{vendor.businessName}</h1>{vendor.verificationStatus === "verified" && <BadgeCheck className="h-5 w-5 text-green-600" />}</div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="h-4 w-4" />{vendor.city}, {vendor.district}, {vendor.state}</p>
              <div className="mt-2 flex items-center gap-4 text-sm"><span className="flex items-center gap-1"><Star className="h-4 w-4 text-secondary-500" fill="currentColor" />{vendor.rating.toFixed(1)} ({vendor.reviewCount} reviews)</span><span className="font-semibold text-primary-700">From {formatCurrency(vendor.startingPrice)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {tabs.map((t) => <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === t.id ? "bg-primary-600 text-white" : "bg-white text-muted ring-1 ring-primary-100 hover:text-primary-700"}`}>{t.label}</button>)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {tab === "about" && <div className="card p-6"><h2 className="heading-sm">About</h2><p className="mt-3 text-sm text-muted">{vendor.about || "No description available."}</p><div className="mt-4 space-y-2 text-sm">{vendor.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary-600" />{vendor.phone}</p>}{vendor.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary-600" />{vendor.email}</p>}{vendor.website && <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary-600" /><a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">{vendor.website}</a></p>}{vendor.businessHours && <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary-600" />{vendor.businessHours.days}: {vendor.businessHours.hours}</p>}</div></div>}
          {tab === "packages" && <div className="space-y-3">{packages.length === 0 ? <p className="text-muted">No packages listed.</p> : packages.map((p) => <div key={p.id} className="card p-4"><h3 className="font-semibold text-primary-900">{p.name}</h3><p className="mt-1 text-sm text-muted">{p.description}</p><p className="mt-2 font-bold text-primary-700">{formatCurrency(p.price)}</p>{p.inclusions.length > 0 && <ul className="mt-2 text-sm text-muted">{p.inclusions.map((inc, i) => <li key={i}>• {inc}</li>)}</ul>}</div>)}</div>}
          {tab === "gallery" && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{gallery.length === 0 ? <p className="text-muted">No images.</p> : gallery.map((g) => <div key={g.id} className="aspect-square overflow-hidden rounded-xl bg-primary-100"><img src={g.imageURL} alt={g.caption ?? ""} className="h-full w-full object-cover" loading="lazy" /></div>)}</div>}
          {tab === "reviews" && <div className="space-y-3">{reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : reviews.map((r) => <div key={r.id} className="card p-4"><div className="flex items-center justify-between"><p className="font-medium text-primary-900">{r.userName}</p><span className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "text-secondary-500" : "text-primary-100"}`} fill="currentColor" />)}</span></div><p className="mt-2 text-sm text-muted">{r.review}</p></div>)}</div>}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20 p-6">
            <h2 className="heading-sm flex items-center gap-2"><Calendar className="h-5 w-5 text-primary-600" />Book Now</h2>
            <form onSubmit={handleBooking} className="mt-4 space-y-3">
              <div><label className="label">Preferred Date</label><input type="date" required className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
              <div><label className="label">Time</label><input type="time" required className="input" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} /></div>
              <div><label className="label">Guest Count</label><input type="number" min="1" required className="input" value={form.guests} onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))} /></div>
              {packages.length > 0 && <div><label className="label">Package</label><select className="input" value={form.packageId} onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}><option value="">Standard</option>{packages.map((p) => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}</select></div>}
              <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} maxLength={300} /></div>
              <button type="submit" disabled={booking} className="btn-primary w-full">{booking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Booking Request"}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
