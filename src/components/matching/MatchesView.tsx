"use client";
import { useEffect, useState } from "react";
import { Sparkles, Loader as Loader2, MapPin, BadgeCheck, Crown, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getProfileByUserId } from "@/lib/profile/profileService";
import { getAIMatches, type MatchScore } from "@/lib/matching/matchService";
import { sendInterest } from "@/lib/matching/matchService";
import { useToast } from "@/components/ui/Toast";
import type { ProfileDocument } from "@/firebase/schema";

export function MatchesView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const profile = await getProfileByUserId(user.uid);
      if (!profile) { setLoading(false); return; }
      const m = await getAIMatches(user.uid, profile);
      setMatches(m);
      setLoading(false);
    })();
  }, [user]);

  const handleInterest = async (p: ProfileDocument) => {
    if (!user) return;
    setSending(p.id);
    const res = await sendInterest(user.uid, user.displayName ?? "User", p.userId, p.id);
    setSending(null);
    if (res.ok) toast("Interest sent!", "success");
    else toast(res.error ?? "Failed", "error");
  };

  if (!user) return <div className="px-4 py-16 text-center text-muted">Please login to view your matches.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="heading-md flex items-center gap-2"><Sparkles className="h-6 w-6 text-secondary-500" />AI Matches</h1><p className="text-lead mt-1 text-sm">Profiles matched using our AI compatibility algorithm</p></div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-72 w-full rounded-2xl" />)}</div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary-300" />
          <p className="mt-3 text-muted">No matches yet. Complete your profile for better matches.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <div key={m.profile.id} className="card overflow-hidden transition hover:shadow-md">
              <div className="flex items-start justify-between bg-gradient-to-r from-secondary-50 to-primary-50 p-3">
                <span className="badge bg-secondary-100 text-secondary-800"><Sparkles className="h-3 w-3" />{m.score}% Match</span>
              </div>
              <div className="flex gap-4 p-4">
                <div className="h-20 w-20 flex-none overflow-hidden rounded-xl bg-primary-100">{m.profile.photoURL && <img src={m.profile.photoURL} alt={m.profile.name} className="h-full w-full object-cover" loading="lazy" />}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5"><h3 className="font-display text-lg font-semibold text-primary-900">{m.profile.name}</h3>{m.profile.verified && <BadgeCheck className="h-4 w-4 text-green-600" />}{m.profile.premium && <Crown className="h-4 w-4 text-secondary-500" />}</div>
                  <p className="text-xs text-muted">{m.profile.religion} · {m.profile.caste ?? ""}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" />{m.profile.district ?? "TN"}</p>
                </div>
              </div>
              <div className="px-4 pb-2"><div className="flex flex-wrap gap-1">{m.reasons.slice(0, 3).map((r) => <span key={r} className="badge bg-primary-50 text-primary-700 text-[10px]">{r}</span>)}</div></div>
              <div className="border-t border-primary-50 p-3"><button type="button" onClick={() => handleInterest(m.profile)} disabled={sending === m.profile.id} className="btn-primary w-full text-sm">{sending === m.profile.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Heart className="h-4 w-4" />Send Interest</>}</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
