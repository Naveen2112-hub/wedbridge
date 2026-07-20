"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, BadgeCheck, Phone, Mail, Globe, Clock, IndianRupee, Briefcase, Star, ArrowLeft, Loader as Loader2, Send, Flag, X, Calendar, Users } from "lucide-react";
import { getVendor } from "@/lib/marketplace/vendorService";
import { getPackages, getGallery } from "@/lib/marketplace/packageService";
import { getReviews, addReview, reportReview } from "@/lib/marketplace/reviewService";
import { createBooking } from "@/lib/marketplace/bookingService";
import { getCategoryName, type VendorDocument, type VendorPackageDocument, type VendorGalleryDocument, type VendorReviewDocument } from "@/firebase/schema";
import { StarRating, StarInput } from "@/components/marketplace/StarRating";
import { cn } from "@/lib/cn";

export default function VendorProfilePage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const [vendor, setVendor] = useState<VendorDocument | null>(null);
  const [packages, setPackages] = useState<VendorPackageDocument[]>([]);
  const [gallery, setGallery] = useState<VendorGalleryDocument[]>([]);
  const [reviews, setReviews] = useState<VendorReviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [tab, setTab] = useState<"about" | "packages" | "gallery" | "reviews">("about");

  useEffect(() => {
    const id = params.id;
    if (!id) return;
    (async () => {
      const v = await getVendor(id);
      setVendor(v);
      if (v) { setPackages(await getPackages(id)); setGallery(await getGallery(id)); setReviews(await getReviews(id)); }
      setLoading(false);
    })();
  }, [params.id]);

  useEffect(() => { if (search.get("book") === "1") setShowBook(true); }, [search]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10"><div className="skeleton h-96 w-full rounded-2xl" /></div>;
  if (!vendor) return <div className="mx-auto max-w-5xl px-4 py-20 text-center"><p className="text-lg font-semibold text-primary-900">Vendor not found</p><Link href="/services" className="btn-primary mt-4">Browse Services</Link></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/services/${vendor.category}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-700"><ArrowLeft className="h-4 w-4" />Back to {getCategoryName(vendor.category)}</Link>

      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
        <div className="relative aspect-[21/9] bg-primary-100">
          {vendor.coverURL && <img src={vendor.coverURL} alt={vendor.businessName} className="h-full w-full object-cover" />}
          {vendor.featured && <span className="absolute left-4 top-4 rounded-full bg-secondary-500 px-3 py-1 text-xs font-bold text-white">Featured</span>}
        </div>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
          {vendor.logoURL ? <img src={vendor.logoURL} alt="" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-primary-100" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 text-primary-400"><Briefcase className="h-10 w-10" /></div>}
          <div className="flex-1">
            <div className="flex items-center gap-2"><h1 className="font-display text-2xl font-bold text-primary-900">{vendor.businessName}</h1>{vendor.verificationStatus === "verified" && <BadgeCheck className="h-5 w-5 text-secondary-600" />}</div>
            <p className="text-sm text-muted">{getCategoryName(vendor.category)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{vendor.city}, {vendor.state}</span>
              {vendor.experienceYears > 0 && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{vendor.experienceYears} years</span>}
              <span className="flex items-center gap-1"><StarRating rating={vendor.rating} />{vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"} ({vendor.reviewCount})</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="flex items-center text-lg font-bold text-primary-900"><IndianRupee className="h-4 w-4" />{vendor.startingPrice.toLocaleString()}<span className="text-sm font-normal text-muted"> onwards</span></p>
            <button type="button" onClick={() => setShowBook(true)} className="btn-primary">Book Now</button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b border-primary-100">
        {(["about", "packages", "gallery", "reviews"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("border-b-2 px-4 py-2 text-sm font-medium capitalize transition", tab === t ? "border-primary-600 text-primary-700" : "border-transparent text-muted hover:text-primary-700")}>{t}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "about" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><h2 className="heading-sm">About</h2><p className="mt-2 whitespace-pre-line text-sm text-ink/80">{vendor.about || "No description provided."}</p></div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100">
              <h3 className="font-semibold text-primary-900">Contact & Info</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {vendor.phone && <li className="flex items-center gap-2 text-ink/80"><Phone className="h-4 w-4 text-primary-500" />{vendor.phone}</li>}
                {vendor.email && <li className="flex items-center gap-2 text-ink/80"><Mail className="h-4 w-4 text-primary-500" />{vendor.email}</li>}
                {vendor.website && <li className="flex items-center gap-2 text-ink/80"><Globe className="h-4 w-4 text-primary-500" /><a href={vendor.website} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{vendor.website}</a></li>}
                {vendor.businessHours && <li className="flex items-center gap-2 text-ink/80"><Clock className="h-4 w-4 text-primary-500" />{vendor.businessHours.days} · {vendor.businessHours.hours}</li>}
                <li className="flex items-center gap-2 text-ink/80"><MapPin className="h-4 w-4 text-primary-500" />{vendor.district}, {vendor.state}</li>
              </ul>
            </div>
          </div>
        )}
        {tab === "packages" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.length === 0 ? <p className="text-sm text-muted">No packages listed.</p> :
              packages.map((p) => (
                <div key={p.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100">
                  <h3 className="font-display text-lg font-semibold text-primary-900">{p.name}</h3>
                  <p className="mt-1 flex items-center text-xl font-bold text-primary-900"><IndianRupee className="h-4 w-4" />{p.price.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-ink/80">{p.description}</p>
                  {p.inclusions.length > 0 && <ul className="mt-3 space-y-1">{p.inclusions.map((i) => <li key={i} className="flex items-start gap-2 text-xs text-ink/70"><Star className="mt-0.5 h-3 w-3 text-secondary-500" />{i}</li>)}</ul>}
                </div>
              ))}
          </div>
        )}
        {tab === "gallery" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.length === 0 ? <p className="text-sm text-muted">No gallery images yet.</p> :
              gallery.map((g) => <div key={g.id} className="aspect-square overflow-hidden rounded-xl bg-primary-100"><img src={g.imageURL} alt={g.caption ?? ""} loading="lazy" className="h-full w-full object-cover" /></div>)}
          </div>
        )}
        {tab === "reviews" && <ReviewsTab vendorId={vendor.id} reviews={reviews} setReviews={setReviews} />}
      </div>

      {showBook && <BookingModal vendor={vendor} packages={packages} onClose={() => setShowBook(false)} />}
    </div>
  );
}

function ReviewsTab({ vendorId, reviews, setReviews }: { vendorId: string; reviews: VendorReviewDocument[]; setReviews: (r: VendorReviewDocument[]) => void }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!review.trim()) return;
    setSubmitting(true);
    await addReview({ vendorId, userId: "guest", userName: name || "Guest User", rating, review });
    setReview(""); setRating(5);
    setReviews([...(await getReviews(vendorId))]);
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100">
        <h3 className="font-semibold text-primary-900">Write a Review</h3>
        <div className="mt-3"><StarInput value={rating} onChange={setRating} /></div>
        <input className="input mt-3" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="input mt-3" rows={3} placeholder="Share your experience…" value={review} onChange={(e) => setReview(e.target.value)} />
        <button type="button" onClick={submit} disabled={submitting} className="btn-primary mt-3"><Send className="h-4 w-4" />{submitting ? "Submitting…" : "Submit Review"}</button>
      </div>
      <div className="space-y-3">
        {reviews.length === 0 ? <p className="text-sm text-muted">No reviews yet. Be the first to review!</p> :
          reviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-semibold text-primary-900">{r.userName}</p>{r.verifiedBooking && <span className="badge bg-green-50 text-green-700">Verified Booking</span>}</div>
                <StarRating rating={r.rating} />
              </div>
              <p className="mt-2 text-sm text-ink/80">{r.review}</p>
              <button type="button" onClick={() => reportReview(r.id)} className="mt-2 flex items-center gap-1 text-xs text-muted hover:text-red-600"><Flag className="h-3 w-3" />Report</button>
            </div>
          ))}
      </div>
    </div>
  );
}

function BookingModal({ vendor, packages, onClose }: { vendor: VendorDocument; packages: VendorPackageDocument[]; onClose: () => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(100);
  const [notes, setNotes] = useState("");
  const [pkgId, setPkgId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!date || !time) return;
    setSubmitting(true);
    const pkg = packages.find((p) => p.id === pkgId);
    await createBooking({ vendorId: vendor.id, vendorName: vendor.businessName, userId: "guest", userName: "Guest User", userEmail: "", packageId: pkgId || undefined, preferredDate: date, time, guestCount: guests, specialNotes: notes, amount: pkg?.price ?? vendor.startingPrice });
    setSubmitting(false); setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"><Star className="h-6 w-6" /></div>
            <h3 className="mt-3 font-display text-xl font-bold text-primary-900">Booking Request Sent!</h3>
            <p className="mt-1 text-sm text-muted">The vendor will confirm your booking shortly.</p>
            <button type="button" onClick={onClose} className="btn-primary mt-4">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold text-primary-900">Book {vendor.businessName}</h3><button type="button" onClick={onClose}><X className="h-5 w-5 text-muted" /></button></div>
            <div className="mt-4 space-y-3">
              {packages.length > 0 && <div><label className="label">Package</label><select className="input" value={pkgId} onChange={(e) => setPkgId(e.target.value)}><option value="">Standard</option>{packages.map((p) => <option key={p.id} value={p.id}>{p.name} - ₹{p.price.toLocaleString()}</option>)}</select></div>}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Preferred Date</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <div><label className="label">Time</label><input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
              </div>
              <div><label className="label">Guest Count</label><input type="number" className="input" value={guests} onChange={(e) => setGuests(Number(e.target.value))} min={1} /></div>
              <div><label className="label">Special Notes</label><textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requirements…" /></div>
            </div>
            <button type="button" onClick={submit} disabled={submitting || !date || !time} className="btn-primary mt-4 w-full"><Calendar className="h-4 w-4" />{submitting ? "Sending…" : "Send Booking Request"}</button>
          </>
        )}
      </div>
    </div>
  );
}
