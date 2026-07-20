"use client";
import { ProfileCard } from "./ProfileCard";
import { ProfileDocument } from "@/firebase/schema";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SearchX } from "lucide-react";

interface Props { profiles: ProfileDocument[]; loading?: boolean; hasMore?: boolean; onLoadMore?: () => void; }

export function ProfileGrid({ profiles, loading, hasMore, onLoadMore }: Props) {
  const { t } = useLanguage();
  if (loading && profiles.length === 0) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading profiles">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-card shadow-card"><div className="skeleton aspect-[3/4] w-full" /><div className="space-y-2 p-4"><div className="skeleton h-3 w-2/3 rounded" /><div className="skeleton h-3 w-1/2 rounded" /><div className="skeleton h-8 w-full rounded-xl" /></div></div>
        ))}
      </div>
    );
  }
  if (!loading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-card p-12 text-center shadow-card">
        <SearchX className="h-12 w-12 text-primary-300" />
        <h3 className="heading-sm mt-4">{t("search.noResults")}</h3>
        <p className="text-lead mt-2 max-w-sm">{t("search.noResultsDesc")}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => <ProfileCard key={p.uid} profile={p} />)}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={`l${i}`} className="overflow-hidden rounded-2xl bg-card shadow-card"><div className="skeleton aspect-[3/4] w-full" /><div className="space-y-2 p-4"><div className="skeleton h-3 w-2/3 rounded" /><div className="skeleton h-8 w-full rounded-xl" /></div></div>
        ))}
      </div>
      {hasMore && !loading && (<div className="mt-8 text-center"><button type="button" onClick={onLoadMore} className="btn-outline">{t("search.loadMore")}</button></div>)}
    </div>
  );
}
