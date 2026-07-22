"use client";
import { useState } from "react";
import { ChevronDown, SlidersHorizontal, Search, RotateCcw } from "lucide-react";
import { SearchFilters as FilterState, SortOption } from "@/lib/search/searchService";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onSearch: () => void;
  onReset: () => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  loading?: boolean;
}

const GENDERS = ["any", "male", "female", "other"];
const MARITAL = ["any", "never_married", "divorced", "widowed", "awaiting_divorce"];
const FAMILY_TYPES = ["any", "nuclear", "joint"];
const FOODS = ["any", "veg", "non_veg", "eggetarian", "jain"];
const LIFESTYLES = ["any", "moderate", "traditional", "modern", "orthodox"];
const YESNO = ["any", "yes", "no"];
const MANGLIK = ["any", "yes", "no", "dont_know"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>{children}</label>);
}

const inputCls = "w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-primary-900 transition focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200";

export function SearchFiltersPanel({ filters, onChange, onSearch, onReset, sort, onSortChange, loading }: Props) {
  const { t } = useLanguage();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary-800" /><h2 className="font-display text-lg font-semibold text-primary-900">{t("search.filters")}</h2></div>
        <button type="button" onClick={onReset} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary-900"><RotateCcw className="h-3.5 w-3.5" />{t("search.reset")}</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={t("search.fields.gender")}><select className={inputCls} value={filters.gender ?? "any"} onChange={(e) => set({ gender: e.target.value })}>{GENDERS.map((g) => <option key={g} value={g}>{g === "any" ? t("search.fields.any") : g}</option>)}</select></Field>
        <Field label={t("search.fields.minAge")}><input type="number" min={18} max={80} className={inputCls} value={filters.minAge ?? ""} onChange={(e) => set({ minAge: e.target.value ? Number(e.target.value) : undefined })} /></Field>
        <Field label={t("search.fields.maxAge")}><input type="number" min={18} max={80} className={inputCls} value={filters.maxAge ?? ""} onChange={(e) => set({ maxAge: e.target.value ? Number(e.target.value) : undefined })} /></Field>
        <Field label={t("search.fields.religion")}><input className={inputCls} value={filters.religion ?? ""} onChange={(e) => set({ religion: e.target.value })} /></Field>
        <Field label={t("search.fields.caste")}><input className={inputCls} value={filters.caste ?? ""} onChange={(e) => set({ caste: e.target.value })} /></Field>
        <Field label={t("search.fields.motherTongue")}><input className={inputCls} value={filters.motherTongue ?? ""} onChange={(e) => set({ motherTongue: e.target.value })} /></Field>
        <Field label={t("search.fields.maritalStatus")}><select className={inputCls} value={filters.maritalStatus ?? "any"} onChange={(e) => set({ maritalStatus: e.target.value })}>{MARITAL.map((m) => <option key={m} value={m}>{m === "any" ? t("search.fields.any") : m.replace(/_/g, " ")}</option>)}</select></Field>
        <Field label={t("search.fields.district")}><input className={inputCls} value={filters.district ?? ""} onChange={(e) => set({ district: e.target.value })} /></Field>
        <Field label={t("search.fields.state")}><input className={inputCls} value={filters.state ?? ""} onChange={(e) => set({ state: e.target.value })} /></Field>
        <Field label={t("search.fields.country")}><input className={inputCls} value={filters.country ?? ""} onChange={(e) => set({ country: e.target.value })} /></Field>
        <Field label={t("search.fields.education")}><input className={inputCls} value={filters.education ?? ""} onChange={(e) => set({ education: e.target.value })} /></Field>
        <Field label={t("search.fields.occupation")}><input className={inputCls} value={filters.occupation ?? ""} onChange={(e) => set({ occupation: e.target.value })} /></Field>
        <Field label={t("search.fields.annualIncome")}><input className={inputCls} value={filters.annualIncome ?? ""} onChange={(e) => set({ annualIncome: e.target.value })} /></Field>
        <Field label={t("search.fields.height")}><input className={inputCls} value={filters.height ?? ""} onChange={(e) => set({ height: e.target.value })} /></Field>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        {([["verified", t("search.fields.verified")], ["premium", t("search.fields.premium")], ["withPhoto", t("search.fields.withPhoto")], ["recentlyJoined", t("search.fields.recentlyJoined")], ["onlineNow", t("search.fields.onlineNow")]] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-primary-900"><input type="checkbox" checked={Boolean(filters[key])} onChange={(e) => set({ [key]: e.target.checked } as Partial<FilterState>)} className="h-4 w-4 accent-primary-700" />{label}</label>
        ))}
      </div>
      <button type="button" onClick={() => setAdvancedOpen((v) => !v)} className="mt-4 flex w-full items-center justify-between rounded-xl bg-primary-50/60 px-4 py-2 text-sm font-medium text-primary-900"><span>{t("search.advanced")}</span><ChevronDown className={cn("h-4 w-4 transition", advancedOpen && "rotate-180")} /></button>
      {advancedOpen && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t("search.fields.star")}><input className={inputCls} value={filters.star ?? ""} onChange={(e) => set({ star: e.target.value })} /></Field>
          <Field label={t("search.fields.rasi")}><input className={inputCls} value={filters.rasi ?? ""} onChange={(e) => set({ rasi: e.target.value })} /></Field>
          <Field label={t("search.fields.manglik")}><select className={inputCls} value={filters.manglik ?? "any"} onChange={(e) => set({ manglik: e.target.value })}>{MANGLIK.map((m) => <option key={m} value={m}>{m === "any" ? t("search.fields.any") : m.replace(/_/g, " ")}</option>)}</select></Field>
          <Field label={t("search.fields.familyType")}><select className={inputCls} value={filters.familyType ?? "any"} onChange={(e) => set({ familyType: e.target.value })}>{FAMILY_TYPES.map((f) => <option key={f} value={f}>{f === "any" ? t("search.fields.any") : f}</option>)}</select></Field>
          <Field label={t("search.fields.food")}><select className={inputCls} value={filters.food ?? "any"} onChange={(e) => set({ food: e.target.value })}>{FOODS.map((f) => <option key={f} value={f}>{f === "any" ? t("search.fields.any") : f.replace(/_/g, " ")}</option>)}</select></Field>
          <Field label={t("search.fields.smoking")}><select className={inputCls} value={filters.smoking ?? "any"} onChange={(e) => set({ smoking: e.target.value })}>{YESNO.map((s) => <option key={s} value={s}>{s === "any" ? t("search.fields.any") : s}</option>)}</select></Field>
          <Field label={t("search.fields.drinking")}><select className={inputCls} value={filters.drinking ?? "any"} onChange={(e) => set({ drinking: e.target.value })}>{YESNO.map((s) => <option key={s} value={s}>{s === "any" ? t("search.fields.any") : s}</option>)}</select></Field>
          <Field label={t("search.fields.lifestyle")}><select className={inputCls} value={filters.lifestyle ?? "any"} onChange={(e) => set({ lifestyle: e.target.value })}>{LIFESTYLES.map((l) => <option key={l} value={l}>{l === "any" ? t("search.fields.any") : l}</option>)}</select></Field>
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onSearch} disabled={loading} className="btn-primary flex-1"><Search className="h-4 w-4" />{loading ? t("search.loading") : t("search.apply")}</button>
      </div>
      <div className="mt-3"><label className="mb-1 block text-xs font-medium text-gray-500">{t("search.sortBy")}</label><select className={inputCls} value={sort} onChange={(e) => onSortChange(e.target.value as SortOption)}><option value="newest">{t("search.sortNewest")}</option><option value="oldest">{t("search.sortOldest")}</option><option value="popular">{t("search.sortPopular")}</option></select></div>
    </div>
  );
}
