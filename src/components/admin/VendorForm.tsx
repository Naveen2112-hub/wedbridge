"use client";
import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { VENDOR_CATEGORIES, type VendorStatus, type VendorCategory } from "@/firebase/schema";
import type { VendorFormData } from "@/lib/admin/vendorAdminService";
import { cn } from "@/lib/utils";
import type { VendorDocument } from "@/firebase/schema";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

const defaultForm: VendorFormData = {
  businessName: "", ownerName: "", email: "", phone: "", whatsapp: "", category: "marriage_halls",
  about: "", address: "", city: "", district: "", state: "Tamil Nadu", pincode: "", services: [],
  startingPrice: 0, experienceYears: 0, gstNumber: "", pan: "",
  location: null, paymentMethods: [],
  coverURL: "", logoURL: "", galleryImages: [],
  socialLinks: { facebook: "", instagram: "", youtube: "", website: "" },
  active: true, featured: false, status: "pending",
};

function toFormData(v: VendorDocument): VendorFormData {
  return {
    businessName: v.businessName ?? "", ownerName: v.ownerName ?? "", email: (v as unknown as Record<string, string>).email ?? "",
    phone: v.phone ?? "", whatsapp: v.whatsapp ?? "", category: v.category ?? "marriage_halls",
    about: v.about ?? "", address: v.address ?? "", city: v.city ?? "",
    district: v.district ?? "", state: v.state ?? "Tamil Nadu",
    pincode: v.pincode ?? "", services: v.services ?? [],
    startingPrice: v.startingPrice ?? 0, experienceYears: v.experienceYears ?? 0,
    gstNumber: "", pan: "", location: null, paymentMethods: [],
    coverURL: v.coverURL ?? "", logoURL: v.logoURL ?? "", galleryImages: [],
    socialLinks: {
      facebook: v.socialLinks?.facebook ?? "", instagram: v.socialLinks?.instagram ?? "",
      youtube: v.socialLinks?.youtube ?? "", website: v.socialLinks?.website ?? "",
    },
    active: v.active ?? true, featured: v.featured ?? false, status: v.status ?? "pending",
  };
}

interface VendorFormProps {
  initial?: VendorDocument;
  onSubmit: (data: VendorFormData) => Promise<boolean>;
  onCancel: () => void;
}

export function VendorForm({ initial, onSubmit, onCancel }: VendorFormProps) {
  const [form, setForm] = useState<VendorFormData>(initial ? toFormData(initial) : defaultForm);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState("");
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof VendorFormData>(key: K, value: VendorFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setSocial = (key: keyof VendorFormData["socialLinks"], value: string) =>
    setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));

  const addService = () => {
    const svc = newService.trim();
    if (!svc || form.services.includes(svc)) return;
    set("services", [...form.services, svc]);
    setNewService("");
  };

  const removeService = (s: string) => set("services", form.services.filter((x) => x !== s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.businessName.trim()) { setError("Business name is required"); return; }
    setSaving(true);
    try {
      const ok = await onSubmit(form);
      if (!ok) setError("Failed to save. Please try again.");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Basic Info */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Basic Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Business Name <span className="text-red-500" aria-hidden="true">*</span></label>
            <input required aria-required="true" className={inputClass} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </div>
          <div><label className={labelClass}>Owner Name</label><input className={inputClass} value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} /></div>
          <div><label className={labelClass}>Email</label><input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label className={labelClass}>Phone</label><input type="tel" className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className={labelClass}>WhatsApp</label><input type="tel" className={inputClass} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value as VendorCategory)}>
              {VENDOR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Starting Price (₹)</label><input type="number" min={0} className={inputClass} value={form.startingPrice} onChange={(e) => set("startingPrice", Number(e.target.value))} /></div>
          <div><label className={labelClass}>Experience (years)</label><input type="number" min={0} className={inputClass} value={form.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} /></div>
          <div><label className={labelClass}>GST Number</label><input className={inputClass} value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value)} /></div>
          <div><label className={labelClass}>PAN</label><input className={inputClass} value={form.pan} onChange={(e) => set("pan", e.target.value)} /></div>
        </div>
        <div className="mt-4"><label className={labelClass}>About</label><textarea rows={4} className={inputClass} value={form.about} onChange={(e) => set("about", e.target.value)} /></div>
      </section>

      {/* Location */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className={labelClass}>Address</label><input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div><label className={labelClass}>City</label><input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
          <div><label className={labelClass}>District</label><input className={inputClass} value={form.district} onChange={(e) => set("district", e.target.value)} /></div>
          <div><label className={labelClass}>State</label><input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
          <div><label className={labelClass}>Pincode</label><input className={inputClass} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></div>
        </div>
      </section>

      {/* Services */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Services Offered</h2>
        <div className="mb-3 flex gap-2">
          <input
            className={cn(inputClass, "flex-1")}
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Add a service..."
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }}
            aria-label="New service name"
          />
          <button type="button" onClick={addService} className="flex items-center gap-1 rounded-xl bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-800">
            <Plus className="h-4 w-4" />Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.services.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">
              {s}
              <button type="button" onClick={() => removeService(s)} className="ml-1 text-primary-400 hover:text-red-500" aria-label={`Remove ${s}`}><Trash2 className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </section>

      {/* Images */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Images</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>Cover Image URL</label><input type="url" className={inputClass} value={form.coverURL} onChange={(e) => set("coverURL", e.target.value)} placeholder="https://..." /></div>
          <div><label className={labelClass}>Logo URL</label><input type="url" className={inputClass} value={form.logoURL} onChange={(e) => set("logoURL", e.target.value)} placeholder="https://..." /></div>
        </div>
      </section>

      {/* Social Links */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Social Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>Website</label><input type="url" className={inputClass} value={form.socialLinks.website ?? ""} onChange={(e) => setSocial("website", e.target.value)} placeholder="https://..." /></div>
          <div><label className={labelClass}>Facebook</label><input type="url" className={inputClass} value={form.socialLinks.facebook ?? ""} onChange={(e) => setSocial("facebook", e.target.value)} placeholder="https://facebook.com/..." /></div>
          <div><label className={labelClass}>Instagram</label><input type="url" className={inputClass} value={form.socialLinks.instagram ?? ""} onChange={(e) => setSocial("instagram", e.target.value)} placeholder="https://instagram.com/..." /></div>
          <div><label className={labelClass}>YouTube</label><input type="url" className={inputClass} value={form.socialLinks.youtube ?? ""} onChange={(e) => setSocial("youtube", e.target.value)} placeholder="https://youtube.com/..." /></div>
        </div>
      </section>

      {/* Status */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Status</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as VendorStatus)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Featured Vendor</span>
            </label>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={saving} className={cn("flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-800", saving && "opacity-50")}>
          <Save className="h-4 w-4" />{saving ? "Saving..." : initial ? "Update Vendor" : "Create Vendor"}
        </button>
      </div>
    </form>
  );
}
