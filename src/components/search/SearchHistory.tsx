"use client";
import { useEffect, useState } from "react";
import { Trash2, Clock } from "lucide-react";
import { SearchHistoryDocument } from "@/firebase/schema";
import { clearSearchHistory, getSearchHistory, type SearchFilters } from "@/lib/search/searchService";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function SearchHistory({ onPick }: { onPick?: (filters: Record<string, unknown>) => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<SearchHistoryDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!user?.uid) return;
    setLoading(true);
    getSearchHistory(user.uid, 8).then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, [user?.uid]);

  if (!loading && items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-900"><Clock className="h-4 w-4 text-secondary-600" />{t("search.history.title")}</h3>
        <button type="button" onClick={async () => { if (!user?.uid) return; await clearSearchHistory(user.uid); setItems([]); }} className="flex items-center gap-1 text-xs text-accent-700 hover:text-accent-800"><Trash2 className="h-3.5 w-3.5" />{t("search.history.clear")}</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((h) => (
          <button key={h.id} type="button" onClick={() => onPick?.(h.filters ?? {})} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-900 transition hover:bg-primary-100">{h.query}</button>
        ))}
      </div>
    </div>
  );
}
