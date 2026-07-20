"use client";
import { useEffect, useState } from "react";
import { Settings, Save, Loader as Loader2 } from "lucide-react";
import { getSettings, saveSettings } from "@/lib/admin/settingsService";
import type { SiteSettings } from "@/firebase/schema";
import { useToast } from "@/components/ui/Toast";
import { sanitizeText } from "@/lib/utils";

export function AdminSettingsView() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getSettings().then((s) => { setSettings(s); setLoading(false); }); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await saveSettings({ ...settings, websiteName: sanitizeText(settings.websiteName), supportEmail: sanitizeText(settings.supportEmail) });
    setSaving(false);
    toast("Settings saved!", "success");
  };

  if (loading || !settings) return <div className="skeleton h-64 w-full rounded-2xl" />;

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md flex items-center gap-2"><Settings className="h-6 w-6 text-primary-600" />Settings</h1><p className="text-lead mt-1 text-sm">Configure platform settings</p></div>
      <form onSubmit={save} className="card max-w-2xl space-y-4 p-6">
        <div><label className="label">Website Name</label><input className="input" value={settings.websiteName} onChange={(e) => setSettings((s) => s ? { ...s, websiteName: e.target.value } : s)} /></div>
        <div><label className="label">Logo URL</label><input className="input" value={settings.logoURL} onChange={(e) => setSettings((s) => s ? { ...s, logoURL: e.target.value } : s)} /></div>
        <div><label className="label">Banner URL</label><input className="input" value={settings.bannerURL} onChange={(e) => setSettings((s) => s ? { ...s, bannerURL: e.target.value } : s)} /></div>
        <div><label className="label">Support Phone</label><input className="input" value={settings.supportPhone} onChange={(e) => setSettings((s) => s ? { ...s, supportPhone: e.target.value } : s)} /></div>
        <div><label className="label">Support Email</label><input type="email" className="input" value={settings.supportEmail} onChange={(e) => setSettings((s) => s ? { ...s, supportEmail: e.target.value } : s)} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Premium Price (₹)</label><input type="number" className="input" value={settings.membershipPricing.premium} onChange={(e) => setSettings((s) => s ? { ...s, membershipPricing: { ...s.membershipPricing, premium: Number(e.target.value) } } : s)} /></div>
          <div><label className="label">Gold Price (₹)</label><input type="number" className="input" value={settings.membershipPricing.gold} onChange={(e) => setSettings((s) => s ? { ...s, membershipPricing: { ...s.membershipPricing, gold: Number(e.target.value) } } : s)} /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Facebook</label><input className="input" value={settings.socialLinks.facebook ?? ""} onChange={(e) => setSettings((s) => s ? { ...s, socialLinks: { ...s.socialLinks, facebook: e.target.value } } : s)} /></div>
          <div><label className="label">Instagram</label><input className="input" value={settings.socialLinks.instagram ?? ""} onChange={(e) => setSettings((s) => s ? { ...s, socialLinks: { ...s.socialLinks, instagram: e.target.value } } : s)} /></div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />Save Settings</>}</button>
      </form>
    </div>
  );
}
