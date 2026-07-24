"use client";

import { useEffect, useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, MapPin, BadgeCheck, Loader as Loader2, Filter } from "lucide-react";
import { VENDOR_CATEGORIES, type VendorDocument } from "@/firebase/schema";
import { getApprovedVendors } from "@/lib/marketplace/vendorService";
import { formatCurrency } from "@/lib/utils";

const VendorCard = memo(function VendorCard({ vendor }: { vendor: VendorDocument }) {
  return (
    <Link href={`/vendor/${vendor.id}`} className="card overflow-hidden transition hover:shadow-md">
      <div className="h-32 overflow-hidden bg-primary-100">{vendor.coverURL && <Image src={vendor.coverURL} alt={vendor.businessName} fill className="h-full w-full object-cover" loading="lazy" />}</div>
      <div className="p-4">
        <div className="flex items-center gap-2"><h3 className="font-display text-lg font-semibold text-primary-900">{vendor.businessName}</h3>{vendor.verificationStatus === "verified" && <BadgeCheck className="h-4 w-4 text-green-600" />}</div>
        <p className="text-xs text-gray-500">{VENDOR_CATEGORIES.find((c) => c.id === vendor.category)?.name ?? vendor.category}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" />{vendor.city}, {vendor.district}</p>
        <div className="mt-2 flex items-center justify-between"><span className="flex items-center gap-1 text-sm font-medium text-primary-900"><Star className="h-3.5 w-3.5 text-secondary-500" fill="currentColor" />{(vendor.rating ?? 0).toFixed(1)}</span><span className="text-sm font-semibold text-primary-700">From {formatCurrency(vendor.startingPrice ?? 0)}</span></div>
      </div>
    </Link>
  );
});

export default function VendorSearchPage() {
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");

  useEffect(() => { getApprovedVendors(200).then((v) => { setVendors(v); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const cities = Array.from(new Set(vendors.map((v) => v.city).filter(Boolean)));
  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchQ = !q || v.businessName?.toLowerCase().includes(q) || v.about?.toLowerCase().includes(q);
    const matchC = cat === "all" || v.category === cat;
    const matchCity = city === "all" || v.city === city;
    return matchQ && matchC && matchCity;
  }).sort((a, b) => sortBy === "rating" ? (b.rating ?? 0) - (a.rating ?? 0) : (a.startingPrice ?? 0) - (b.startingPrice ?? 0));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-neutral-900">Vendor Search</h1><p className="mt-1 text-sm text-neutral-500">Find and book trusted wedding vendors across Tamil Nadu</p></div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><input className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none" placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All Categories</option>{VENDOR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" value={city} onChange={(e) => setCity(e.target.value)}><option value="all">All Cities</option>{cities.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <select className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value as "rating" | "price")}><option value="rating">Sort by Rating</option><option value="price">Sort by Price</option></select>
      </div>
      <p className="mb-4 text-sm text-neutral-500">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""} found</p>
      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 w-full rounded-2xl" />)}</div>
      : filtered.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center text-neutral-500"><Filter className="mx-auto h-12 w-12 text-neutral-300" /><p className="mt-3">No vendors found matching your criteria.</p></div>
      : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((v) => <VendorCard key={v.id} vendor={v} />)}</div>}
    </div>
  );
}
