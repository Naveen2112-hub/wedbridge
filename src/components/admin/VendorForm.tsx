"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { VENDOR_CATEGORIES, type VendorCategory, type VendorStatus, type VendorSocialLinks } from "@/firebase/schema";
import type { VendorFormData } from "@/lib/admin/vendorAdminService";
import type { VendorDocument } from "@/firebase/schema";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface VendorFormProps {
  initial?: VendorDocument;
  onSubmit: (data: VendorFormData) => Promise<boolean>;
  onCancel: () => void;
}

const defaultForm: VendorFormData = {
  businessName: "",
  category: "photographers",
  about: "",
  services: [],
  experienceYears: 0,
  gstNumber: "",
  pan: "",
  ownerName: "",
  email: "",
  phone: "",
  whatsapp: "",
  state: "",
  district: "",
  city: "",
  address: "",
  pincode: "",
  location: null,
  startingPrice: 0,
  paymentMethods: [],
  logoURL: "",
  coverURL: "",
  galleryImages: [],
  socialLinks: {},
  status: "approved",
  featured: false,
  active: true,
};

export function VendorForm({ initial, onSubmit, onCancel }: VendorFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VendorFormData>(() => initial ? {
    businessName: initial.businessName ?? "",
    category: initial.category,
    about: initial.about ?? "",
    services: initial.services ?? [],
    experienceYears: initial.experienceYears ?? 0,
    gstNumber: initial.gstNumber ?? "",
    pan: initial.pan ?? "",
    ownerName: initial.ownerName ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    whatsapp: initial.whatsapp ?? "",
    state: initial.state ?? "",
    district: initial.district ?? "",
    city: initial.city ?? "",
    address: initial.address ?? "",
    pincode: initial.pincode ?? "",
    location: initial.location ?? null,
    startingPrice: initial.startingPrice ?? 0,
    paymentMethods: initial.paymentMethods ?? [],
    logoURL: initial.logoURL ?? "",
    coverURL: initial.coverURL ?? "",
    galleryImages: initial.galleryImages ?? [],
    socialLinks: initial.socialLinks ?? {},
    status: initial.status,
    featured: initial.featured ?? false,
    active: initial.active ?? false,
  } : defaultForm);
  const [serviceInput, setServiceInput] = useState("");
  const [paymentInput, setPaymentInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");

  const set = <K extends keyof VendorFormData>(key: K, value: VendorFormData[K]) => setForm((f) => ({ ...f, [key]: value }));

  const addService = () => { if (serviceInput.trim()) { set("services", [...form.services, serviceInput.trim()]); setServiceInput(""); } };
  const removeService = (i: number) => set("services", form.services.filter((_, idx) => idx !== i));
  const addPayment = () => { if (paymentInput.trim()) { set("paymentMethods", [...form.paymentMethods, paymentInput.trim()]); setPaymentInput(""); } };
  const removePayment = (i: number) => set("paymentMethods", form.paymentMethods.filter((_, idx) => idx !== i));
  const addGalleryImage = () => { if (galleryInput.trim()) { set("galleryImages", [...form.galleryImages, galleryInput.trim()]); setGalleryInput(""); } };
  const removeGalleryImage = (i: number) => set("galleryImages", form.galleryImages.filter((_, idx) => idx !== i));

  const setSocial = (key: keyof VendorSocialLinks, value: string) => set("socialLinks", { ...form.socialLinks, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) { toast("Business name is required", "error"); return; }
    if (!form.ownerName.trim()) { toast("Owner name is required", "error"); return; }
    if (!form.phone.trim()) { toast("Phone number is required", "error"); return; }
    setSaving(true);
    const ok = await onSubmit(form);
    setSaving(false);
    if (ok) toast(initial ? "Vendor updated successfully" : "Vendor created successfully", "success");
    else toast(initial ? "Failed to update vendor" : "Failed to create vendor", "error");
  };

  const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Information */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Business Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>Business Name *</label><input className={inputClass} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required /></div>
          <div><label className={labelClass}>Category *</label><select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value as VendorCategory)}>{VENDOR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea className={inputClass} rows={3} value={form.about} onChange={(e) => set("about", e.target.value)} /></div>
          <div><label className={labelClass}>Experience (Years)</label><input type="number" min={0} className={inputClass} value={form.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} /></div>
          <div><label className={labelClass}>GST Number</label><input className={inputClass} value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value)} /></div>
          <div><label className={labelClass}>PAN (Optional)</label><input className={inputClass} value={form.pan} onChange={(e) => set("pan", e.target.value)} /></div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Services</label>
            <div className="flex gap-2">
              <input className={inputClass} value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} placeholder="Add a service" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }} />
              <button type="button" onClick={addService} className="flex-none rounded-xl bg-primary-50 px-3 py-2 text-primary-700 hover:bg-primary-100"><Plus className="h-4 w-4" /></button>
            </div>
            {form.services.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{form.services.map((s, i) => <span key={i} className="flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-xs text-primary-700">{s}<button type="button" onClick={() => removeService(i)}><X className="h-3 w-3" /></button></span>)}</div>}
          </div>
        </div>
      </section>

      {/* Owner Details */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Owner Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>Owner Name *</label><input className={inputClass} value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} required /></div>
          <div><label className={labelClass}>Email</label><input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label className={labelClass}>Mobile Number *</label><input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} required /></div>
          <div><label className={labelClass}>WhatsApp</label><input className={inputClass} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
        </div>
      </section>

      {/* Location */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>State</label><input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
          <div><label className={labelClass}>District</label><input className={inputClass} value={form.district} onChange={(e) => set("district", e.target.value)} /></div>
          <div><label className={labelClass}>City</label><input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
          <div><label className={labelClass}>Pincode</label><input className={inputClass} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className={labelClass}>Full Address</label><textarea className={inputClass} rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className={labelClass}>Google Maps Location (Lat, Lng)</label><div className="flex gap-2"><input type="number" step="any" className={inputClass} placeholder="Latitude" value={form.location?.lat ?? ""} onChange={(e) => set("location", { lat: Number(e.target.value), lng: form.location?.lng ?? 0 })} /><input type="number" step="any" className={inputClass} placeholder="Longitude" value={form.location?.lng ?? ""} onChange={(e) => set("location", { lat: form.location?.lat ?? 0, lng: Number(e.target.value) })} /></div></div>
        </div>
      </section>

      {/* Pricing */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>Starting Price (₹)</label><input type="number" min={0} className={inputClass} value={form.startingPrice} onChange={(e) => set("startingPrice", Number(e.target.value))} /></div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Payment Methods</label>
            <div className="flex gap-2">
              <input className={inputClass} value={paymentInput} onChange={(e) => setPaymentInput(e.target.value)} placeholder="Add payment method" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPayment(); } }} />
              <button type="button" onClick={addPayment} className="flex-none rounded-xl bg-primary-50 px-3 py-2 text-primary-700 hover:bg-primary-100"><Plus className="h-4 w-4" /></button>
            </div>
            {form.paymentMethods.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{form.paymentMethods.map((p, i) => <span key={i} className="flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-xs text-primary-700">{p}<button type="button" onClick={() => removePayment(i)}><X className="h-3 w-3" /></button></span>)}</div>}
          </div>
        </div>
      </section>

      {/* Media */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Media</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>Logo URL</label><input className={inputClass} value={form.logoURL} onChange={(e) => set("logoURL", e.target.value)} placeholder="https://..." /></div>
          <div><label className={labelClass}>Cover Image URL</label><input className={inputClass} value={form.coverURL} onChange={(e) => set("coverURL", e.target.value)} placeholder="https://..." /></div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Gallery Images</label>
            <div className="flex gap-2">
              <input className={inputClass} value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} placeholder="Add image URL" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGalleryImage(); } }} />
              <button type="button" onClick={addGalleryImage} className="flex-none rounded-xl bg-primary-50 px-3 py-2 text-primary-700 hover:bg-primary-100"><Plus className="h-4 w-4" /></button>
            </div>
            {form.galleryImages.length > 0 && <div className="mt-2 space-y-1">{form.galleryImages.map((url, i) => <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600"><span className="flex-1 truncate">{url}</span><button type="button" onClick={() => removeGalleryImage(i)} className="text-red-500 hover:text-red-700"><Trash2 className="h-3 w-3" /></button></div>)}</div>}
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Social Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>Website</label><input className={inputClass} value={form.socialLinks.website ?? ""} onChange={(e) => setSocial("website", e.target.value)} placeholder="https://..." /></div>
          <div><label className={labelClass}>Facebook</label><input className={inputClass} value={form.socialLinks.facebook ?? ""} onChange={(e) => setSocial("facebook", e.target.value)} placeholder="https://facebook.com/..." /></div>
          <div><label className={labelClass}>Instagram</label><input className={inputClass} value={form.socialLinks.instagram ?? ""} onChange={(e) => setSocial("instagram", e.target.value)} placeholder="https://instagram.com/..." /></div>
          <div><label className={labelClass}>YouTube</label><input className={inputClass} value={form.socialLinks.youtube ?? ""} onChange={(e) => setSocial("youtube", e.target.value)} placeholder="https://youtube.com/..." /></div>
        </div>
      </section>

      {/* Status */}
      <section className="card p-5">
        <h2 className="heading-sm mb-4">Status</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className={labelClass}>Status</label><select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as VendorStatus)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select></div>
          <div className="flex items-end"><label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" /><span className="text-sm font-medium text-gray-700">Active</span></label></div>
          <div className="flex items-end"><label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" /><span className="text-sm font-medium text-gray-700">Featured Vendor</span></label></div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving} className={cn("flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-800", saving && "opacity-50")}>
          <Save className="h-4 w-4" />{saving ? "Saving..." : initial ? "Update Vendor" : "Create Vendor"}
        </button>
      </div>
    </form>
  );
}

