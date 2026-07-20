"use client";
import { useEffect, useState, memo } from "react";
import Link from "next/link";
import { Search, Star, MapPin, BadgeCheck, Loader as Loader2 } from "lucide-react";
import { VENDOR_CATEGORIES } from "@/firebase/schema";
import { getApprovedVendors } from "@/lib/marketplace/vendorService";
import type { VendorDocument } from "@/firebase/schema";
import { formatCurrency } from "@/lib/utils";

export function ServicesView() {
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => { getApprovedVendors(100).then((v) => { setVendors(v); setLoading(false); }); }, []);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchQ = !q || v.businessName?.toLowerCase().includes(q) || v.city?.toLowerCase().includes(q);
    const matchC = cat === "all" || v.category === cat;
    return matchQ && matchC;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="heading-md">Wedding Services</h1><p className="text-lead mt-1 text-sm">Find and book trusted wedding vendors</p></div>
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input className="input pl-10" placeholder="Search vendors…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="input max-w-[200px]" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All Categories</option>{VENDOR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 w-full rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-muted">No vendors found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => <VendorCard key={v.id} vendor={v} />)}
        </div>
      )}
    </div>
  );
}

const VendorCard = memo(function VendorCard({ vendor }: { vendor: VendorDocument }) {
  return (
    <Link href={`/vendor/${vendor.id}`} className="card overflow-hidden transition hover:shadow-md">
      <div className="h-32 overflow-hidden bg-primary-100">{vendor.coverURL && <img src={vendor.coverURL} alt={vendor.businessName} className="h-full w-full object-cover" loading="lazy" />}</div>
      <div className="p-4">
        <div className="flex items-center gap-2"><h3 className="font-display text-lg font-semibold text-primary-900">{vendor.businessName}</h3>{vendor.verificationStatus === "verified" && <BadgeCheck className="h-4 w-4 text-green-600" />}</div>
        <p className="text-xs text-muted">{VENDOR_CATEGORIES.find((c) => c.id === vendor.category)?.name ?? vendor.category}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" />{vendor.city}, {vendor.district}</p>
        <div className="mt-2 flex items-center justify-between"><span className="flex items-center gap-1 text-sm font-medium text-primary-900"><Star className="h-3.5 w-3.5 text-secondary-500" fill="currentColor" />{vendor.rating.toFixed(1)}</span><span className="text-sm font-semibold text-primary-700">From {formatCurrency(vendor.startingPrice)}</span></div>
      </div>
    </Link>
  );
});
