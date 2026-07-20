"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, Loader as Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { listFavourites, removeFavourite, listRecentlyFavourited, type FavouriteWithProfile } from "@/lib/favourites/favouriteService";
import { calculateAge } from "@/lib/format";

const PAGE_SIZE = 12;

export default function FavouritesClient() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<FavouriteWithProfile[]>([]);
  const [recent, setRecent] = useState<FavouriteWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = async (uid: string) => {
    setLoading(true);
    const [all, rec] = await Promise.all([listFavourites(uid, 50), listRecentlyFavourited(uid, 6)]);
    setItems(all); setRecent(rec); setLoading(false);
  };

  useEffect(() => { if (user?.uid) load(user.uid); }, [user?.uid]);

  const handleRemove = async (profileId: string) => {
    if (!user?.uid) return;
    setBusy(profileId);
    try {
      await removeFavourite(user.uid, profileId);
      setItems((prev) => prev.filter((f) => f.profileId !== profileId));
      setRecent((prev) => prev.filter((f) => f.profileId !== profileId));
    } finally { setBusy(null); }
  };

  const visible = useMemo(() => items.slice(0, page * PAGE_SIZE), [items, page]);

  return (
    <AuthGuard><ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="heading-lg flex items-center gap-2"><Star className="h-7 w-7 text-secondary-600" />{t("favourites.title")}</h1><p className="text-lead mt-2">{t("favourites.subtitle")}</p></div>
          <span className="badge-secondary">{items.length} {t("favourites.count")}</span>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4] w-full rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-md"><Star className="h-12 w-12 text-primary-300" /><h3 className="heading-sm mt-4">{t("favourites.empty")}</h3><p className="text-lead mt-2 max-w-sm">{t("favourites.emptyDesc")}</p></div>
        ) : (
          <>
            {recent.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <h2 className="font-display text-lg font-semibold text-primary-900">{t("favourites.recentlyFavourited")}</h2>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {recent.map((f) => f.profile && (
                    <Link key={f.id} href={`/profile/${f.profile.uid}`} className="flex-none">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full bg-primary-100">{f.profile.photoURL ? <Image src={f.profile.photoURL} alt={f.profile.name} fill sizes="64px" className="object-cover" /> : <Heart className="flex h-full items-center justify-center text-primary-300" />}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((f) => {
                const p = f.profile;
                const age = p?.dateOfBirth ? calculateAge(p.dateOfBirth) : null;
                return (
                  <div key={f.id} className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg">
                    <Link href={`/profile/${f.profileId}`} className="block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-primary-100">
                        {p?.photoURL ? <Image src={p.photoURL} alt={p.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-primary-300"><Heart className="h-10 w-10" /></div>}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-primary-950/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-white"><p className="font-display text-base font-semibold drop-shadow">{p?.name ?? "Member"}{age ? `, ${age}` : ""}</p><p className="text-xs text-white/85">{[p?.occupation, p?.district].filter(Boolean).join(" • ")}</p></div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between gap-2 p-4">
                      <Link href={`/profile/${f.profileId}`} className="btn-outline flex-1 justify-center py-2 text-xs">{t("favourites.viewProfile")}</Link>
                      <button type="button" disabled={busy === f.profileId} onClick={() => handleRemove(f.profileId)} className="btn-outline py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />{t("favourites.remove")}</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {visible.length < items.length && <button type="button" onClick={() => setPage((p) => p + 1)} className="btn-outline mx-auto block">{t("search.loadMore")}</button>}
          </>
        )}
        {busy && <Loader2 className="fixed bottom-6 right-6 h-6 w-6 animate-spin text-primary-700" />}
      </div>
    </ProtectedLayout></AuthGuard>
  );
}
