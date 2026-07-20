"use client";
import { useState } from "react";
import { Settings as SettingsIcon, Globe, Bell, Shield, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { cn } from "@/lib/cn";

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  return (
    <AuthGuard>
      <ProtectedLayout>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><SettingsIcon className="h-6 w-6" /></span>
            <div><h1 className="heading-md">Settings</h1><p className="text-lead text-sm">Account settings, language, and privacy preferences.</p></div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Globe className="h-5 w-5" /></span>
                <div><h2 className="heading-sm">Language Preference</h2><p className="text-caption">Choose your preferred language</p></div>
              </div>
              <div className="mt-4 flex gap-3">
                {(["en", "ta"] as const).map((l) => (
                  <button key={l} type="button" onClick={() => setLang(l)} className={cn("rounded-xl border px-4 py-2.5 text-sm font-medium transition-all", lang === l ? "border-primary-500 bg-primary-50 text-primary-700" : "border-primary-200 text-gray-900/70 hover:bg-primary-50")}>
                    {l === "en" ? "English" : "தமிழ்"}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600"><Bell className="h-5 w-5" /></span>
                <div><h2 className="heading-sm">Notifications</h2><p className="text-caption">Manage how you receive notifications</p></div>
              </div>
              <div className="mt-4 space-y-3">
                {[{ label: "Email Notifications", desc: "Receive match alerts via email", val: notifEmail, set: setNotifEmail }, { label: "Push Notifications", desc: "Get notified in real-time", val: notifPush, set: setNotifPush }].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-primary-100 px-4 py-3">
                    <div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
                    <button type="button" onClick={() => item.set(!item.val)} className={cn("relative h-6 w-11 rounded-full transition-colors", item.val ? "bg-primary-600" : "bg-primary-200")} aria-label={item.label}>
                      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform", item.val ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600"><Shield className="h-5 w-5" /></span>
                <div><h2 className="heading-sm">Privacy</h2><p className="text-caption">Control your profile visibility</p></div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-primary-100 px-4 py-3">
                <div><p className="text-sm font-medium text-gray-900">Profile Visible to Others</p><p className="text-xs text-gray-500">Allow your profile to appear in search results</p></div>
                <button type="button" onClick={() => setProfileVisible(!profileVisible)} className={cn("relative h-6 w-11 rounded-full transition-colors", profileVisible ? "bg-primary-600" : "bg-primary-200")} aria-label="Profile visibility">
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform", profileVisible ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </div>
            </div>

            <div className="card border-error-200 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-50 text-error-600"><Trash2 className="h-5 w-5" /></span>
                <div><h2 className="heading-sm text-error-700">Danger Zone</h2><p className="text-caption">Irreversible account actions</p></div>
              </div>
              <button type="button" className="btn-danger mt-4">Delete My Account</button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    </AuthGuard>
  );
}
