"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, Send, Check, X, Ban, Undo2, Crown, Loader as Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { getProfile } from "@/lib/profile/profileService";
import { subscribeInterests, acceptInterest, rejectInterest, cancelInterest, withdrawInterest, getTodaySentCount, InterestLimitError, type InterestDirection, type InterestWithProfile } from "@/lib/interests/interestService";
import type { InterestDocument, ProfileDocument } from "@/firebase/schema";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 12;

export default function InterestsClient() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<InterestDirection>("received");
  const [raw, setRaw] = useState<InterestDocument[]>([]);
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [sentToday, setSentToday] = useState(0);
  const [limitError, setLimitError] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user?.uid) return;
    let unsub = () => {};
    (async () => {
      const p = await getProfile(user.uid);
      setProfile(p);
      setSentToday(await getTodaySentCount(user.uid));
      unsub = subscribeInterests(user.uid, tab, (items) => { setRaw(items); setLoading(false); }, 50);
    })();
    return () => unsub();
  }, [user?.uid, tab]);

  useEffect(() => { setPage(1); }, [tab]);

  const items: InterestWithProfile[] = useMemo(() => raw.map((d) => {
    const otherUid = (tab === "sent" ? d.receiverId : d.senderId) ?? "";
    return { ...d, profileUid: otherUid, profileName: "Member", profilePhoto: undefined };
  }), [raw, tab]);

  const visible = items.slice(0, page * PAGE_SIZE);

  const handleAccept = async (id: string) => { setBusy(id); try { await acceptInterest(id, profile?.name ?? "Member", (raw.find((r) => r.id === id)?.senderId) ?? ""); } finally { setBusy(null); } };
  const handleReject = async (id: string) => { setBusy(id); try { await rejectInterest(id, profile?.name ?? "Member", (raw.find((r) => r.id === id)?.senderId) ?? ""); } finally { setBusy(null); } };
  const handleCancel = async (id: string) => { setBusy(id); try { await cancelInterest(id); } finally { setBusy(null); } };
  const handleWithdraw = async (id: string) => { setBusy(id); try { await withdrawInterest(id); } finally { setBusy(null); } };

  const isPremium = profile?.membership && profile.membership !== "free";
  const statusCls: Record<string, string> = {
    pending: "bg-primary-50 text-primary-800", accepted: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700", cancelled: "bg-gray-100 text-gray-500", expired: "bg-gray-100 text-gray-500",
  };

  return (
    <AuthGuard><ProtectedLayout>
      <div className="space-y-6">
        <div><h1 className="heading-lg flex items-center gap-2"><HeartHandshake className="h-7 w-7 text-secondary-600" />{t("interests.title")}</h1><p className="text-lead mt-2">{t("interests.subtitle")}</p></div>

        {!isPremium && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary-200 bg-secondary-50/60 p-4">
            <p className="text-sm text-secondary-900">{t("interests.dailyLimit")} <span className="font-semibold">{sentToday}/20</span> {t("interests.sentToday")}</p>
            <Link href="/membership" className="btn-secondary text-sm"><Crown className="h-4 w-4" />{t("interests.upgrade")}</Link>
          </div>
        )}
        {limitError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{t("interests.limitReached")}</p>}

        <div className="flex gap-2" role="tablist">
          {(["received", "sent"] as InterestDirection[]).map((d) => (
            <button key={d} role="tab" aria-selected={tab === d} onClick={() => setTab(d)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", tab === d ? "bg-primary text-white shadow-sm" : "bg-white text-primary-800 hover:bg-primary-50")}>{t(`interests.tabs.${d}` as never)}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-2xl" />)}</div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-md"><HeartHandshake className="h-12 w-12 text-primary-300" /><h3 className="heading-sm mt-4">{tab === "received" ? t("interests.emptyReceived") : t("interests.emptySent")}</h3></div>
        ) : (
          <div className="space-y-3">
            {visible.map((it) => (
              <div key={it.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-md">
                <Link href={`/profile/${it.profileUid}`} className="relative h-14 w-14 flex-none overflow-hidden rounded-full bg-primary-100">
                  {it.profilePhoto ? <Image src={it.profilePhoto} alt={it.profileName} fill sizes="56px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-primary-300"><HeartHandshake className="h-6 w-6" /></div>}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/profile/${it.profileUid}`} className="block truncate text-sm font-semibold text-primary-900 hover:text-secondary-700">{it.profileName}</Link>
                  <span className={cn("badge mt-1", statusCls[it.status] ?? statusCls.pending)}>{t(`interests.${it.status}` as never)}</span>
                </div>
                {tab === "received" && it.status === "pending" && (
                  <div className="flex gap-2">
                    <button type="button" disabled={busy === it.id} onClick={() => handleAccept(it.id)} className="btn-primary py-2 text-xs"><Check className="h-3.5 w-3.5" />{t("interests.accept")}</button>
                    <button type="button" disabled={busy === it.id} onClick={() => handleReject(it.id)} className="btn-outline py-2 text-xs"><X className="h-3.5 w-3.5" />{t("interests.reject")}</button>
                  </div>
                )}
                {tab === "sent" && it.status === "pending" && (
                  <div className="flex gap-2">
                    <button type="button" disabled={busy === it.id} onClick={() => handleCancel(it.id)} className="btn-outline py-2 text-xs"><Ban className="h-3.5 w-3.5" />{t("interests.cancel")}</button>
                    <button type="button" disabled={busy === it.id} onClick={() => handleWithdraw(it.id)} className="btn-outline py-2 text-xs"><Undo2 className="h-3.5 w-3.5" />{t("interests.withdraw")}</button>
                  </div>
                )}
                {busy === it.id && <Loader2 className="h-4 w-4 animate-spin text-primary-700" />}
              </div>
            ))}
            {visible.length < items.length && <button type="button" onClick={() => setPage((p) => p + 1)} className="btn-outline mx-auto block">{t("search.loadMore")}</button>}
          </div>
        )}
      </div>
    </ProtectedLayout></AuthGuard>
  );
}
