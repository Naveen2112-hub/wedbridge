"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Loader as Loader2, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { VENDOR_CATEGORIES, type VendorCategory, type VendorDocument } from "@/firebase/schema";
import { createVendor } from "@/lib/marketplace/vendorService";

export default function VendorCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ businessName: "", category: "photographers" as VendorCategory, about: "", city: "", district: "", phone: "", email: "", startingPrice: 0, experienceYears: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast("Please login first.", "error"); router.push("/login"); return; }
    setSubmitting(true);
    try {
      await createVendor({ ownerUid: user.uid, ownerName: user.displayName ?? "", businessName: form.businessName, category: form.category, logoURL: "", coverURL: "", about: form.about, city: form.city, district: form.district, state: "Tamil Nadu", phone: form.phone, email: form.email, startingPrice: Number(form.startingPrice), experienceYears: Number(form.experienceYears), location: null, contactVisibility: "after_accept" } as Omit<VendorDocument, "id" | "createdAt" | "updatedAt" | "rating" | "reviewCount" | "featured" | "status" | "verificationStatus">);
      toast("Vendor profile created! Pending approval.", "success");
      router.push("/vendor-dashboard");
    } catch { toast("Failed to create vendor profile.", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100"><Store className="h-7 w-7 text-rose-600" /></div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Create Vendor Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">List your wedding business on WedBridge marketplace</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div><label className="mb-1 block text-sm font-medium text-neutral-700">Business Name *</label><input type="text" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" /></div>
        <div><label className="mb-1 block text-sm font-medium text-neutral-700">Category *</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as VendorCategory })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none">{VENDOR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="mb-1 block text-sm font-medium text-neutral-700">About Your Business *</label><textarea required rows={4} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-neutral-700">City *</label><input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium text-neutral-700">District *</label><input type="text" required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-neutral-700">Phone *</label><input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium text-neutral-700">Email *</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-neutral-700">Starting Price (Rs.) *</label><input type="number" required min={0} value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: Number(e.target.value) })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium text-neutral-700">Years of Experience *</label><input type="number" required min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" /></div>
        </div>
        <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{submitting ? "Creating..." : "Create Vendor Profile"}</button>
      </form>
    </div>
  );
}
