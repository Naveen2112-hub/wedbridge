"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ProfileDocument } from "@/firebase/schema";
import { getRecentlyViewed } from "@/lib/search/searchService";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Eye } from "lucide-react";

export function RecentlyViewed() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<ProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user?.uid) return;
    getRecentlyViewed(user.uid, 6).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, [user?.uid]);
  if (!loading && items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-secondary-600" /><h3 className="font-display text-lg font-semibold text-primary-900">{t("dashboard.recentlyViewed")}</h3></div>
      {loading ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-square w-full rounded-xl" />)}</div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {items.map((p) => (
            <Link key={p.uid} href={`/profile/${p.uid}`} className="group">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-primary-100">{p.photoURL ? <Image src={p.photoURL} alt={p.name} fill sizes="15vw" className="object-cover transition group-hover:scale-105" /> : null}</div>
              <p className="mt-1 truncate text-xs font-medium text-primary-900">{p.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
