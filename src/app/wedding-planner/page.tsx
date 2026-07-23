"use client";

import { useState } from "react";
import { CalendarCheck, Loader as Loader2, Check, Users, IndianRupee, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { VENDOR_CATEGORIES } from "@/firebase/schema";

export default function WeddingPlannerPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    city: "",
    guestCount: 100,
    budget: 500000,
    categories: [] as string[],
    notes: "",
  });

  const toggleCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast("Wedding plan submitted! Our team will contact you soon.", "success");
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
          <CalendarCheck className="h-7 w-7 text-rose-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">Wedding Planner</h1>
        <p className="mt-2 text-neutral-600">Plan your dream wedding with WedBridge. Tell us your requirements and we&apos;ll connect you with the best vendors.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Bride&apos;s Name *</label>
            <input type="text" required value={form.brideName} onChange={(e) => setForm({ ...form, brideName: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Groom&apos;s Name *</label>
            <input type="text" required value={form.groomName} onChange={(e) => setForm({ ...form, groomName: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Wedding Date *</label>
            <input type="date" required value={form.weddingDate} onChange={(e) => setForm({ ...form, weddingDate: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">City *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Guest Count *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input type="number" required min={1} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Budget (Rs.) *</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input type="number" required min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Services Needed</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {VENDOR_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  form.categories.includes(c.id)
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {form.categories.includes(c.id) && <Check className="h-3 w-3" />}
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Additional Notes</label>
          <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" placeholder="Tell us about your wedding vision, specific requirements, cultural preferences, etc." />
        </div>

        <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {submitting ? "Submitting..." : "Submit Wedding Plan"}
        </button>
      </form>
    </div>
  );
}
