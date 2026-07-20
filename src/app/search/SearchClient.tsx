"use client";
import { useCallback, useEffect, useState } from "react";
import { SearchFiltersPanel } from "@/components/search/SearchFiltersPanel";
import { ProfileGrid } from "@/components/search/ProfileGrid";
import { SearchHistory } from "@/components/search/SearchHistory";
import { SearchFilters as FilterState, searchProfiles, saveSearchHistory, type SortOption } from "@/lib/search/searchService";
import { ProfileDocument } from "@/firebase/schema";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export default function SearchClient() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortOption>("newest");
  const [profiles, setProfiles] = useState<ProfileDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (reset = true) => {
    setLoading(true);
    try {
      const cursor = reset ? null : lastVisible;
      const res = await searchProfiles(filters, sort, cursor);
      setProfiles((prev) => (reset ? res.profiles : [...prev, ...res.profiles]));
      setLastVisible(res.lastVisible);
      setHasMore(res.hasMore);
      if (reset && user?.uid) saveSearchHistory(user.uid, filters).catch(() => {});
      setSearched(true);
    } finally { setLoading(false); }
  }, [filters, sort, lastVisible, user?.uid]);

  useEffect(() => { runSearch(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handleReset = () => { setFilters({}); setSort("newest"); setProfiles([]); setSearched(false); };

  return (
    <AuthGuard><ProtectedLayout>
      <div className="space-y-6">
        <div><h1 className="heading-lg">{t("search.title")}</h1><p className="text-lead mt-2">{t("search.subtitle")}</p></div>
        <SearchHistory onPick={(f) => setFilters(f as FilterState)} />
        <SearchFiltersPanel filters={filters} onChange={setFilters} onSearch={() => runSearch(true)} onReset={handleReset} sort={sort} onSortChange={setSort} loading={loading} />
        {searched && <p className="text-sm text-gray-500">{t("search.showing")} {profiles.length} {t("search.of")} {t("search.results")}</p>}
        <ProfileGrid profiles={profiles} loading={loading} hasMore={hasMore} onLoadMore={() => runSearch(false)} />
      </div>
    </ProtectedLayout></AuthGuard>
  );
}
