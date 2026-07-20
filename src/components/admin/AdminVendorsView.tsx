"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Store, Loader as Loader2, BadgeCheck, Star } from "lucide-react";
import { listAllVendors, updateVendor } from "@/lib/marketplace/vendorService";
import type { VendorDocument } from "@/firebase/schema";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function AdminVendorsView() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => { setLoading(true); const v = await listAllVendors(200); setVendors(v); setLoading(false); };
  useEffect(() => { load(); }, []);

  const toggleVerify = async (v: VendorDocument) => {
    setActing(v.id);
    await updateVendor(v.id, { verificationStatus: v.verificationStatus === "verified" ? "unverified" : "verified" });
    setActing(null); toast("Vendor updated", "success"); load();
  };

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Vendors</h1><p className="text-lead mt-1 text-sm">Manage all wedding service vendors</p></div>
      {loading ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40 w-full rounded-xl" />)}</div> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <div key={v.id} className="card p-4">
              <div className="flex items-center gap-3"><div className="h-12 w-12 overflow-hidden rounded-xl bg-primary-100">{v.coverURL && <Image src={v.coverURL} alt={v.businessName} fill className="h-full w-full object-cover" />}</div><div className="flex-1"><h3 className="font-semibold text-primary-900">{v.businessName}</h3><p className="text-xs text-gray-500">{v.city}, {v.district}</p></div></div>
              <div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 text-secondary-500" fill="currentColor" />{v.rating.toFixed(1)}</span><span className="text-sm font-semibold">{formatCurrency(v.startingPrice)}</span></div>
                {acting === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <button type="button" onClick={() => toggleVerify(v)} className={cn("badge", v.verificationStatus === "verified" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}><BadgeCheck className="h-3 w-3" />{v.verificationStatus}</button>}
              </div>
              <p className="mt-2 text-xs text-gray-500">{formatDate(v.createdAt as unknown as string)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
