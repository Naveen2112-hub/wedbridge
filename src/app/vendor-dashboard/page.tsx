"use client";
import { useEffect, useState } from "react";
import { Store, Calendar, IndianRupee, Star, Image as ImageIcon, Package, ChartBar as BarChart3, Plus, X, CircleCheck as CheckCircle2, Clock, Circle as XCircle } from "lucide-react";
import { getVendorByOwner, createVendor, updateVendor } from "@/lib/marketplace/vendorService";
import type { VendorDocument } from "@/firebase/schema";
import { getPackages, addPackage } from "@/lib/marketplace/packageService";
import { getGallery, addGalleryImage } from "@/lib/marketplace/packageService";
import { getVendorBookings, updateBookingStatus } from "@/lib/marketplace/bookingService";
import { getReviews } from "@/lib/marketplace/reviewService";
import { VENDOR_CATEGORIES, getCategoryName, type VendorPackageDocument, type VendorGalleryDocument, type VendorBookingDocument, type VendorReviewDocument, type VendorCategory, type BookingStatus } from "@/firebase/schema";
import { cn } from "@/lib/cn";

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<VendorDocument | null>(null);
  const [packages, setPackages] = useState<VendorPackageDocument[]>([]);
  const [gallery, setGallery] = useState<VendorGalleryDocument[]>([]);
  const [bookings, setBookings] = useState<VendorBookingDocument[]>([]);
  const [reviews, setReviews] = useState<VendorReviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "profile" | "gallery" | "packages" | "bookings" | "reviews">("overview");

  useEffect(() => {
    (async () => {
      const v = await getVendorByOwner("vendor-demo");
      setVendor(v);
      if (v) {
        setPackages(await getPackages(v.id));
        setGallery(await getGallery(v.id));
        setBookings(await getVendorBookings(v.id));
        setReviews(await getReviews(v.id));
      }
      setLoading(false);
    })();
  }, []);

  const revenue = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.amount, 0);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10"><div className="skeleton h-96 w-full rounded-2xl" /></div>;

  if (!vendor) return <CreateVendorForm onCreated={() => window.location.reload()} />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="heading-lg">{vendor.businessName}</h1><p className="text-lead mt-2">{getCategoryName(vendor.category)} · {vendor.city}</p></div>
        <span className={cn("badge", vendor.status === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>{vendor.status}</span>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-primary-100">
        {(["overview", "profile", "gallery", "packages", "bookings", "reviews"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium capitalize transition", tab === t ? "border-primary-600 text-primary-700" : "border-transparent text-muted hover:text-primary-700")}>{t}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Calendar} label="Total Bookings" value={String(bookings.length)} color="text-blue-600" />
            <Stat icon={Clock} label="Pending" value={String(bookings.filter((b) => b.status === "pending").length)} color="text-amber-600" />
            <Stat icon={IndianRupee} label="Revenue" value={`₹${revenue.toLocaleString()}`} color="text-green-600" />
            <Stat icon={Star} label="Rating" value={vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"} color="text-secondary-600" />
          </div>
        )}
        {tab === "profile" && <ProfileForm vendor={vendor} onSave={(d) => { updateVendor(vendor.id, d); setVendor({ ...vendor, ...d }); }} />}
        {tab === "gallery" && <GalleryManager vendorId={vendor.id} gallery={gallery} setGallery={setGallery} />}
        {tab === "packages" && <PackageManager vendorId={vendor.id} packages={packages} setPackages={setPackages} />}
        {tab === "bookings" && <BookingsManager bookings={bookings} onUpdate={(id, s) => { updateBookingStatus(id, s); setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: s } : b)); }} />}
        {tab === "reviews" && (
          <div className="space-y-3">
            {reviews.length === 0 ? <p className="text-sm text-muted">No reviews yet.</p> :
              reviews.map((r) => <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-primary-900">{r.userName}</p><span className="text-xs text-muted">{r.rating}/5</span></div><p className="mt-2 text-sm text-ink/80">{r.review}</p></div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100"><div className="flex items-center gap-3"><span className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50", color)}><Icon className="h-5 w-5" /></span><p className="text-sm text-muted">{label}</p></div><p className="mt-3 font-display text-2xl font-bold text-primary-900">{value}</p></div>;
}

function CreateVendorForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<VendorCategory>("photographers");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState(10000);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name) return;
    setSubmitting(true);
    await createVendor({ ownerUid: "vendor-demo", businessName: name, category, logoURL: "", coverURL: "", about: "", city, district: "", state: "", location: null, phone: "", email: "", startingPrice: price, experienceYears: 0, contactVisibility: "after_booking" } as never);
    setSubmitting(false); onCreated();
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100">
        <h1 className="heading-md">Register Your Business</h1>
        <p className="text-lead mt-2 text-sm">Create your vendor profile to start receiving bookings.</p>
        <div className="mt-4 space-y-3">
          <div><label className="label">Business Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Category</label><select className="input" value={category} onChange={(e) => setCategory(e.target.value as VendorCategory)}>{VENDOR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label">City</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div><label className="label">Starting Price</label><input type="number" className="input" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
        </div>
        <button type="button" onClick={submit} disabled={submitting} className="btn-primary mt-4 w-full"><Store className="h-4 w-4" />{submitting ? "Creating…" : "Create Vendor Profile"}</button>
      </div>
    </div>
  );
}

function ProfileForm({ vendor, onSave }: { vendor: VendorDocument; onSave: (d: Partial<VendorDocument>) => void }) {
  const [form, setForm] = useState({ businessName: vendor.businessName, about: vendor.about, city: vendor.city, state: vendor.state, phone: vendor.phone, email: vendor.email, website: vendor.website ?? "", startingPrice: vendor.startingPrice, experienceYears: vendor.experienceYears, logoURL: vendor.logoURL, coverURL: vendor.coverURL });
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100">
      <h2 className="heading-sm">Business Profile</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div><label className="label">Business Name</label><input className="input" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></div>
        <div><label className="label">Starting Price</label><input type="number" className="input" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: Number(e.target.value) })} /></div>
        <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
        <div><label className="label">State</label><input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
        <div><label className="label">Experience (years)</label><input type="number" className="input" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} /></div>
        <div className="sm:col-span-2"><label className="label">About</label><textarea className="input" rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></div>
        <div><label className="label">Logo URL</label><input className="input" value={form.logoURL} onChange={(e) => setForm({ ...form, logoURL: e.target.value })} /></div>
        <div><label className="label">Cover URL</label><input className="input" value={form.coverURL} onChange={(e) => setForm({ ...form, coverURL: e.target.value })} /></div>
      </div>
      <button type="button" onClick={() => { onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="btn-primary mt-4">{saved ? "Saved!" : "Save Changes"}</button>
    </div>
  );
}

function GalleryManager({ vendorId, gallery, setGallery }: { vendorId: string; gallery: VendorGalleryDocument[]; setGallery: (g: VendorGalleryDocument[]) => void }) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const add = async () => { if (!url) return; await addGalleryImage(vendorId, url, caption); setGallery(await getGallery(vendorId)); setUrl(""); setCaption(""); };
  return (
    <div>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100">
        <h3 className="font-semibold text-primary-900">Add Image</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2"><input className="input" placeholder="Image URL" value={url} onChange={(e) => setUrl(e.target.value)} /><input className="input" placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} /></div>
        <button type="button" onClick={add} className="btn-primary mt-3"><Plus className="h-4 w-4" />Add Image</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {gallery.length === 0 ? <p className="text-sm text-muted">No images yet.</p> : gallery.map((g) => <div key={g.id} className="aspect-square overflow-hidden rounded-xl bg-primary-100"><img src={g.imageURL} alt={g.caption ?? ""} loading="lazy" className="h-full w-full object-cover" /></div>)}
      </div>
    </div>
  );
}

function PackageManager({ vendorId, packages, setPackages }: { vendorId: string; packages: VendorPackageDocument[]; setPackages: (p: VendorPackageDocument[]) => void }) {
  const [form, setForm] = useState({ name: "", description: "", price: 0, inclusions: "" });
  const add = async () => { if (!form.name) return; await addPackage(vendorId, { name: form.name, description: form.description, price: form.price, inclusions: form.inclusions.split(",").map((s) => s.trim()).filter(Boolean) }); setPackages(await getPackages(vendorId)); setForm({ name: "", description: "", price: 0, inclusions: "" }); };
  return (
    <div>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100">
        <h3 className="font-semibold text-primary-900">Add Package</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Price</label><input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Inclusions (comma separated)</label><input className="input" value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} /></div>
        </div>
        <button type="button" onClick={add} className="btn-primary mt-3"><Plus className="h-4 w-4" />Add Package</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.length === 0 ? <p className="text-sm text-muted">No packages yet.</p> : packages.map((p) => <div key={p.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100"><p className="font-semibold text-primary-900">{p.name}</p><p className="text-sm font-bold text-primary-900">₹{p.price.toLocaleString()}</p><p className="mt-1 text-xs text-muted">{p.description}</p></div>)}
      </div>
    </div>
  );
}

function BookingsManager({ bookings, onUpdate }: { bookings: VendorBookingDocument[]; onUpdate: (id: string, s: BookingStatus) => void }) {
  if (bookings.length === 0) return <p className="text-sm text-muted">No booking requests yet.</p>;
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100">
          <div><p className="font-semibold text-primary-900">{b.userName}</p><p className="text-xs text-muted">{new Date(b.preferredDate as unknown as string).toLocaleDateString()} · {b.time} · {b.guestCount} guests</p>{b.specialNotes && <p className="mt-1 text-xs text-muted">"{b.specialNotes}"</p>}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary-900">₹{b.amount.toLocaleString()}</span>
            <span className={cn("badge", b.status === "pending" ? "bg-amber-50 text-amber-700" : b.status === "confirmed" ? "bg-blue-50 text-blue-700" : b.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{b.status}</span>
            {b.status === "pending" && <><button type="button" onClick={() => onUpdate(b.id, "confirmed")} className="btn-outline px-3 py-1 text-xs">Confirm</button><button type="button" onClick={() => onUpdate(b.id, "cancelled")} className="btn-outline px-3 py-1 text-xs text-red-600">Decline</button></>}
            {b.status === "confirmed" && <button type="button" onClick={() => onUpdate(b.id, "completed")} className="btn-outline px-3 py-1 text-xs">Mark Done</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
