"use client";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { AiMatchFilters, type AiTab } from "@/lib/ai/aiMatchService";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";

interface Props {
  filters: AiMatchFilters;
  onChange: (next: AiMatchFilters) => void;
  onApply: () => void;
  onReset: () => void;
  loading?: boolean;
}

const inputCls = "w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-primary-900 transition focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200";

export function AiMatchFiltersPanel({ filters, onChange, onApply, onReset, loading }: Props) {
  const { t } = useLanguage();
  const set = (patch: Partial<AiMatchFilters>) => onChange({ ...filters, ...patch });
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary-800" /><h2 className="font-display text-lg font-semibold text-primary-900">{t("ai.filters")}</h2></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">{t("ai.minScore")}</span><input type="number" min={0} max={100} className={inputCls} value={filters.minScore ?? ""} onChange={(e) => set({ minScore: e.target.value ? Number(e.target.value) : undefined })} /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">{t("search.fields.minAge")}</span><input type="number" min={18} max={80} className={inputCls} value={filters.minAge ?? ""} onChange={(e) => set({ minAge: e.target.value ? Number(e.target.value) : undefined })} /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">{t("search.fields.maxAge")}</span><input type="number" min={18} max={80} className={inputCls} value={filters.maxAge ?? ""} onChange={(e) => set({ maxAge: e.target.value ? Number(e.target.value) : undefined })} /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">{t("search.fields.district")}</span><input className={inputCls} value={filters.district ?? ""} onChange={(e) => set({ district: e.target.value })} /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">{t("search.fields.religion")}</span><input className={inputCls} value={filters.religion ?? ""} onChange={(e) => set({ religion: e.target.value })} /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">{t("search.fields.caste")}</span><input className={inputCls} value={filters.caste ?? ""} onChange={(e) => set({ caste: e.target.value })} /></label>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-primary-900"><input type="checkbox" checked={Boolean(filters.premium)} onChange={(e) => set({ premium: e.target.checked })} className="h-4 w-4 accent-primary-700" />{t("search.fields.premium")}</label>
        <label className="flex items-center gap-2 text-sm text-primary-900"><input type="checkbox" checked={Boolean(filters.verified)} onChange={(e) => set({ verified: e.target.checked })} className="h-4 w-4 accent-primary-700" />{t("search.fields.verified")}</label>
      </div>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onApply} disabled={loading} className="btn-primary flex-1">{loading ? t("ai.refreshing") : t("ai.apply")}</button>
        <button type="button" onClick={onReset} className="btn-outline"><RotateCcw className="h-4 w-4" />{t("ai.reset")}</button>
      </div>
    </div>
  );
}

export function AiTabs({ active, onChange }: { active: AiTab; onChange: (t: AiTab) => void }) {
  const { t } = useLanguage();
  const tabs: AiTab[] = ["top", "today", "recent", "near", "educated", "premium", "active"];
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => (
        <button key={tab} type="button" role="tab" aria-selected={active === tab} onClick={() => onChange(tab)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", active === tab ? "bg-primary text-white shadow-sm" : "bg-white text-primary-800 hover:bg-primary-50")}>{t(`ai.tabs.${tab}` as never)}</button>
      ))}
    </div>
  );
}
