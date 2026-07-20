"use client";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Loader as Loader2, CircleCheck as CheckCircle2, Plus, Trash2 } from "lucide-react";
import { getSettings, saveSettings } from "@/lib/admin/settingsService";
import { defaultSettings, type SiteSettings } from "@/firebase/schema";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { getSettings().then((s) => { setSettings(s); setLoading(false); }); }, []);

  const save = async () => {
    setSaving(true);
    await saveSettings(settings);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (patch: Partial<SiteSettings>) => setSettings((s) => ({ ...s, ...patch }));

  if (loading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 w-full rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="heading-md flex items-center gap-2"><SettingsIcon className="h-6 w-6 text-primary-600" />Settings</h1><p className="text-lead mt-1 text-sm">Configure website, support, social and pricing.</p></div>
        <button type="button" onClick={save} disabled={saving} className="btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saving ? "Saving…" : saved ? "Saved!" : "Save"}</button>
      </div>
      <div className="space-y-6">
        <Section title="General">
          <Field label="Website Name" value={settings.websiteName} onChange={(v) => update({ websiteName: v })} />
          <Field label="Logo URL" value={settings.logoURL} onChange={(v) => update({ logoURL: v })} />
          <Field label="Banner URL" value={settings.bannerURL} onChange={(v) => update({ bannerURL: v })} />
        </Section>
        <Section title="Support">
          <Field label="Support Phone" value={settings.supportPhone} onChange={(v) => update({ supportPhone: v })} />
          <Field label="Support Email" value={settings.supportEmail} onChange={(v) => update({ supportEmail: v })} />
        </Section>
        <Section title="Social Links">
          <Field label="Facebook" value={settings.socialLinks.facebook ?? ""} onChange={(v) => update({ socialLinks: { ...settings.socialLinks, facebook: v } })} />
          <Field label="Instagram" value={settings.socialLinks.instagram ?? ""} onChange={(v) => update({ socialLinks: { ...settings.socialLinks, instagram: v } })} />
          <Field label="Twitter" value={settings.socialLinks.twitter ?? ""} onChange={(v) => update({ socialLinks: { ...settings.socialLinks, twitter: v } })} />
          <Field label="YouTube" value={settings.socialLinks.youtube ?? ""} onChange={(v) => update({ socialLinks: { ...settings.socialLinks, youtube: v } })} />
        </Section>
        <Section title="Membership Pricing">
          <Field label="Premium (₹)" type="number" value={String(settings.membershipPricing.premium)} onChange={(v) => update({ membershipPricing: { ...settings.membershipPricing, premium: Number(v) } })} />
          <Field label="Gold (₹)" type="number" value={String(settings.membershipPricing.gold)} onChange={(v) => update({ membershipPricing: { ...settings.membershipPricing, gold: Number(v) } })} />
        </Section>
        <Section title="Homepage Banners">
          <div className="sm:col-span-2 space-y-2">
            {settings.homepageBanners.map((b, i) => <div key={i} className="flex gap-2"><input className="input" value={b} onChange={(e) => update({ homepageBanners: settings.homepageBanners.map((x, idx) => idx === i ? e.target.value : x) })} /><button type="button" onClick={() => update({ homepageBanners: settings.homepageBanners.filter((_, idx) => idx !== i) })} className="btn-outline px-3"><Trash2 className="h-4 w-4" /></button></div>)}
            <button type="button" onClick={() => update({ homepageBanners: [...settings.homepageBanners, ""] })} className="btn-outline text-sm"><Plus className="h-4 w-4" />Add Banner</button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100"><h2 className="heading-sm">{title}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div></div>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <div><label className="label">{label}</label><input type={type} className="input" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
