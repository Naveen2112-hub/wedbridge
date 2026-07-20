"use client";
import { useEffect, useState } from "react";
import { Search, Store, BadgeCheck, Star, Trash2 } from "lucide-react";
import { listAllVendors, updateVendor } from "@/lib/marketplace/vendorService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { VENDOR_CATEGORIES, type VendorDocument } from "@/firebase/schema";
import { cn, formatCurrency } from "@/lib/utils";

export default function AdminVendorsPage() {
  const { adminUser } = useAdminAuth();
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const admin = adminUser ? { uid: adminUser.uid, email: adminUser.email } : undefined;

  useEffect(() => { listAllVendors(500).then((v) => { setVendors(v); setLoading(false); }); }, []);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const match = !q || v.businessName?.toLowerCase().includes(q) || v.city?.toLowerCase().includes(q);
    const f = filter === "all" ? true : v.status === filter;
    return match && f;
  });

  const act = async (v: VendorDocument, data: Partial<VendorDocument>) => { await updateVendor(v.id, data); setVendors((prev) => prev.map((x) => x.id === v.id ? { ...x, ...data } : x)); };

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Wedding Vendors</h1><p className="text-lead mt-1 text-sm">Approve, verify and manage wedding vendors.</p></div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input className="input pl-10" placeholder="Search vendors…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="input max-w-[180px]" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}><option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-primary-100 text-left text-muted"><th className="p-3">Vendor</th><th className="p-3">Category</th><th className="p-3">Location</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-muted">No vendors found.</td></tr> :
            filtered.map((v) => (
              <tr key={v.id} className="border-b border-primary-100 last:border-0">
                <td className="p-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700"><Store className="h-4 w-4" /></span><div><p className="font-medium text-primary-900">{v.businessName}</p><p className="text-xs text-muted flex items-center gap-1"><Star className="h-3 w-3 text-secondary-500" fill="currentColor" />{v.rating.toFixed(1)} · {formatCurrency(v.startingPrice)}</p></div></div></td>
                <td className="p-3 text-xs">{VENDOR_CATEGORIES.find((c) => c.id === v.category)?.name ?? v.category}</td>
                <td className="p-3 text-xs">{v.city}, {v.district}</td>
                <td className="p-3"><span className={cn("badge", v.status === "approved" ? "bg-green-50 text-green-700" : v.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>{v.status}</span></td>
                <td className="p-3"><div className="flex flex-wrap gap-1">
                  {v.status !== "approved" && <button type="button" onClick={() => act(v, { status: "approved" })} className="rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100">Approve</button>}
                  {v.status !== "rejected" && <button type="button" onClick={() => act(v, { status: "rejected" })} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">Reject</button>}
                  <button type="button" onClick={() => act(v, { verificationStatus: v.verificationStatus === "verified" ? "unverified" : "verified" })} className={cn("rounded-lg px-2 py-1 text-xs font-medium", v.verificationStatus === "verified" ? "bg-secondary-50 text-secondary-700" : "bg-gray-50 text-muted")}><BadgeCheck className="inline h-3 w-3" />{v.verificationStatus === "verified" ? "Verified" : "Verify"}</button>
                  <button type="button" onClick={() => act(v, { featured: !v.featured })} className={cn("rounded-lg px-2 py-1 text-xs font-medium", v.featured ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-muted")}>{v.featured ? "Featured" : "Feature"}</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
