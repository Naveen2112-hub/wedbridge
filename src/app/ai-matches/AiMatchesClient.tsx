"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, RefreshCw, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { getProfileByUserId } from "@/lib/profile/profileService";
import { AiMatchCard } from "@/components/ai/AiMatchCard";
import { AiMatchFiltersPanel, AiTabs } from "@/components/ai/AiMatchFiltersPanel";
import { AiMatchFilters, AiTab, ScoredMatch, generateAiMatches, getCachedMatches, saveCachedMatches, filterMatches, applyTab, limitByMembership, FREE_DAILY_LIMIT } from "@/lib/ai/aiMatchService";
import type { ProfileDocument } from "@/firebase/schema";

export default function AiMatchesClient() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [matches, setMatches] = useState<ScoredMatch[]>([]);
  const [filters, setFilters] = useState<AiMatchFilters>({});
  const [tab, setTab] = useState<AiTab>("top");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  const loadMatches = useCallback(async (force = false) => {
    if (!user?.uid) return;
    const myProfile = await getProfileByUserId(user.uid);
    setProfile(myProfile);
    if (!myProfile) { setLoading(false); return; }
    if (!force) {
      const cached = await getCachedMatches(user.uid);
      if (cached && cached.length > 0) { setMatches(cached); setFromCache(true); setLoading(false); return; }
    }
    setRefreshing(true);
    try {
      const generated = await generateAiMatches(myProfile, 50);
      setMatches(generated);
      setFromCache(false);
      await saveCachedMatches(user.uid, generated);
    } finally { setRefreshing(false); setLoading(false); }
  }, [user?.uid]);

  useEffect(() => { loadMatches(false); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.uid]);

  const handleRefresh = () => loadMatches(true);
  const handleReset = () => { setFilters({}); };

  const isPremium = profile?.membership && profile.membership !== "free";
  const filtered = filterMatches(matches, filters);
  const tabbed = applyTab(filtered, tab, profile ?? ({} as ProfileDocument));
  const limited = limitByMembership(tabbed, profile?.membership);

  return (
    <AuthGuard><ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="heading-lg flex items-center gap-2"><Sparkles className="h-7 w-7 text-secondary-600" />{t("ai.title")}</h1><p className="text-lead mt-2">{t("ai.subtitle")}</p></div>
          <button type="button" onClick={handleRefresh} disabled={refreshing} className="btn-primary"><RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />{refreshing ? t("ai.refreshing") : t("ai.refresh")}</button>
        </div>

        {!isPremium && matches.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary-200 bg-secondary-50/60 p-4">
            <p className="text-sm text-secondary-900">{t("ai.freeLimit")}</p>
            <Link href="/membership" className="btn-secondary text-sm"><Crown className="h-4 w-4" />{t("ai.upgrade")}</Link>
          </div>
        )}
        {isPremium && matches.length > 0 && <p className="text-sm text-gray-500">{t("ai.premiumUnlimited")}</p>}

        <AiMatchFiltersPanel filters={filters} onChange={setFilters} onApply={() => setTab("top")} onReset={handleReset} loading={refreshing} />
        <AiTabs active={tab} onChange={setTab} />

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading AI matches">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-md"><div className="skeleton aspect-[3/4] w-full" /><div className="space-y-2 p-4"><div className="skeleton h-3 w-2/3 rounded" /><div className="skeleton h-8 w-full rounded-xl" /></div></div>
            ))}
          </div>
        ) : limited.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-md">
            <Sparkles className="h-12 w-12 text-primary-300" />
            <h3 className="heading-sm mt-4">{t("ai.noMatches")}</h3>
            <p className="text-lead mt-2 max-w-sm">{t("ai.noMatchesDesc")}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {limited.map((m) => <AiMatchCard key={m.profile.uid} match={m} />)}
          </div>
        )}
        {fromCache && !loading && <p className="text-center text-xs text-gray-500">Cached results • {t("ai.refresh")} {t("ai.refresh").toLowerCase()}</p>}
      </div>
    </ProtectedLayout></AuthGuard>
  );
}
