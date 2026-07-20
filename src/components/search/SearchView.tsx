"use client";
import { useEffect, useState, useCallback, memo } from "react";
import { Search, SlidersHorizontal, Loader as Loader2, MapPin, BadgeCheck, Crown, Star } from "lucide-react";
import { searchProfiles, type SearchFilters, type SearchResult } from "@/lib/profile/profileService";
import type { ProfileDocument } from "@/firebase/schema";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { sendInterest } from "@/lib/matching/matchService";
import { cn } from "@/lib/utils";

const religions = ["Hindu", "Christian", "Muslim", "Sikh", "Jain"];
const districts = ["Chennai", "Coimbatore", "Madurai", "Tirunelveli", "Salem", "Trichy", "Vellore"];

export function SearchView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<ProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ gender: "female" });
  const [cursor, setCursor] = useState<SearchResult["cursor"]>(null);
  const [hasMore, setHasMore] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    const r = await searchProfiles(filters);
    setResults(r.profiles); setCursor(r.cursor); setHasMore(r.hasMore);
    setLoading(false);
  }, [filters]);

  useEffect(() => { doSearch(); }, [doSearch]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const r = await searchProfiles(filters, cursor);
    setResults((prev) => [...prev, ...r.profiles]); setCursor(r.cursor); setHasMore(r.hasMore);
    setLoadingMore(false);
  };

  const handleInterest = async (p: ProfileDocument) => {
    if (!user) { toast("Please login to send interest", "error"); return; }
    setSending(p.id);
    const res = await sendInterest(user.uid, user.displayName ?? "User", p.userId, p.id);
    setSending(null);
    if (res.ok) toast("Interest sent!", "success");
    else toast(res.error ?? "Failed to send interest", "error");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="heading-md">Find Your Match</h1><p className="text-lead mt-1 text-sm">Search verified profiles across Tamil Nadu</p></div>
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input className="input pl-10" placeholder="Search by caste…" onChange={(e) => setFilters((f) => ({ ...f, caste: e.target.value }))} /></div>
        <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-outline"><SlidersHorizontal className="h-4 w-4" />Filters</button>
      </div>
      {showFilters && (
        <div className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className="label">Looking For</label><select className="input" value={filters.gender} onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value as "male" | "female" }))}><option value="female">Bride</option><option value="male">Groom</option></select></div>
          <div><label className="label">Religion</label><select className="input" value={filters.religion ?? ""} onChange={(e) => setFilters((f) => ({ ...f, religion: e.target.value || undefined }))}><option value="">Any</option>{religions.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="label">District</label><select className="input" value={filters.district ?? ""} onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value || undefined }))}><option value="">Any</option>{districts.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
          <div><label className="label">Verified Only</label><select className="input" value={filters.verifiedOnly ? "yes" : "no"} onChange={(e) => setFilters((f) => ({ ...f, verifiedOnly: e.target.value === "yes" }))}><option value="no">No</option><option value="yes">Yes</option></select></div>
        </div>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 w-full rounded-2xl" />)}</div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-muted">No profiles found. Try adjusting your filters.</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => <ProfileCard key={p.id} profile={p} sending={sending === p.id} onInterest={() => handleInterest(p)} />)}
          </div>
          {hasMore && <div className="mt-6 text-center"><button type="button" onClick={loadMore} disabled={loadingMore} className="btn-outline">{loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load More"}</button></div>}
        </>
      )}
    </div>
  );
}

const ProfileCard = memo(function ProfileCard({ profile, sending, onInterest }: { profile: ProfileDocument; sending: boolean; onInterest: () => void }) {
  return (
    <div className="card overflow-hidden transition hover:shadow-md">
      <div className="flex gap-4 p-4">
        <div className="h-20 w-20 flex-none overflow-hidden rounded-xl bg-primary-100">{profile.photoURL && <img src={profile.photoURL} alt={profile.name} className="h-full w-full object-cover" loading="lazy" />}</div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5"><h3 className="font-display text-lg font-semibold text-primary-900">{profile.name}</h3>{profile.verified && <BadgeCheck className="h-4 w-4 text-green-600" />}{profile.premium && <Crown className="h-4 w-4 text-secondary-500" />}</div>
          <p className="text-xs text-muted">{profile.religion} · {profile.caste ?? "Any"}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" />{profile.district ?? profile.city ?? "Tamil Nadu"}</p>
          <p className="mt-1 text-xs text-muted">{profile.occupation ?? ""}</p>
        </div>
      </div>
      <div className="border-t border-primary-50 p-3"><button type="button" onClick={onInterest} disabled={sending} className="btn-primary w-full text-sm">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Interest"}</button></div>
    </div>
  );
});
