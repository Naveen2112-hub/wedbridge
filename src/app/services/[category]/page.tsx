"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Store, SlidersHorizontal, Loader as Loader2 } from "lucide-react";
import { searchVendors, type VendorFilters, type VendorListResult } from "@/lib/marketplace/vendorService";
import { VENDOR_CATEGORIES, getCategoryName, type VendorCategory, type VendorDocument } from "@/firebase/schema";
import { VendorCard } from "@/components/marketplace/VendorCard";

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const category = (params?.category ?? "all") as VendorCategory | "all";
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VendorFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const f: VendorFilters = category === "all" ? { ...filters } : { ...filters, category: category as VendorCategory };
    searchVendors(f).then((res: VendorListResult) => { setVendors(res.vendors); setLoading(false); });
  }, [category, filters]);

  const title = category === "all" ? "All Wedding Services" : getCategoryName(category as VendorCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-800"><Store className="h-3.5 w-3.5" />{VENDOR_CATEGORIES.length} Categories</span>
          <h1 className="heading-md mt-3">{title}</h1>
        </div>
        <button type="button" onClick={() => setShowFilters((s) => !s)} className="btn-outline text-sm"><SlidersHorizontal className="h-4 w-4" />Filters</button>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className="label">City</label><input className="input" value={filters.city ?? ""} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value || undefined }))} placeholder="e.g. Chennai" /></div>
          <div><label className="label">Min Rating</label><select className="input" value={filters.minRating ?? ""} onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value ? Number(e.target.value) : undefined }))}><option value="">Any</option><option value="3">3+</option><option value="4">4+</option><option value="4.5">4.5+</option></select></div>
          <div><label className="label">Max Price</label><input type="number" className="input" value={filters.maxPrice ?? ""} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value ? Number(e.target.value) : undefined }))} placeholder="₹" /></div>
          <div className="flex items-end gap-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.verifiedOnly ?? false} onChange={(e) => setFilters((f) => ({ ...f, verifiedOnly: e.target.checked || undefined }))} />Verified only</label></div>
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-80 w-full rounded-2xl" />)}</div>
      ) : vendors.length === 0 ? (
        <div className="mt-12 rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-primary-100">
          <Store className="mx-auto h-10 w-10 text-primary-300" />
          <p className="mt-3 font-medium text-primary-900">No vendors found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters or check back soon.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}</div>
      )}
    </div>
  );
}
