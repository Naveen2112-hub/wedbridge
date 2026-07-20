"use client";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2, Loader as Loader2, HeartHandshake, Heart, Sparkles, Eye, Crown, MessageCircle, Megaphone } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { subscribeNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/lib/notifications/notificationService";
import type { NotificationDocument, NotificationType } from "@/firebase/schema";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 10;

const typeIcon: Partial<Record<NotificationType, React.ComponentType<{ className?: string }>>> = {
  interest_received: HeartHandshake, interest_accepted: CheckCheck, interest_rejected: XIcon, profile_viewed: Eye,
  premium_activated: Crown, new_ai_matches: Sparkles, new_message: MessageCircle, admin_announcement: Megaphone,
};
function XIcon({ className }: { className?: string }) { return <Heart className={className} />; }

function tsToDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (typeof ts === "number") return new Date(ts);
  if (typeof ts === "object" && ts && "toMillis" in ts && typeof (ts as { toMillis: () => number }).toMillis === "function") return new Date((ts as { toMillis: () => number }).toMillis());
  return null;
}

export default function NotificationsClient() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<NotificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeNotifications(user.uid, (list) => { setItems(list); setLoading(false); }, 50);
    return () => unsub();
  }, [user?.uid]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const visible = useMemo(() => items.slice(0, page * PAGE_SIZE), [items, page]);

  const handleRead = async (id: string) => { setBusy(id); try { await markNotificationRead(id); } finally { setBusy(null); } };
  const handleDelete = async (id: string) => { setBusy(id); try { await deleteNotification(id); setItems((prev) => prev.filter((n) => n.id !== id)); } finally { setBusy(null); } };
  const handleMarkAll = async () => { if (!user?.uid) return; setBusy("all"); try { await markAllNotificationsRead(user.uid); } finally { setBusy(null); } };

  return (
    <AuthGuard><ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="heading-lg flex items-center gap-2"><Bell className="h-7 w-7 text-secondary-600" />{t("notifications.title")}</h1><p className="text-lead mt-2">{t("notifications.subtitle")}</p></div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && <span className="badge-secondary">{unreadCount} {t("notifications.unread")}</span>}
            {unreadCount > 0 && <button type="button" disabled={busy === "all"} onClick={handleMarkAll} className="btn-outline text-sm"><CheckCheck className="h-4 w-4" />{t("notifications.markAllRead")}</button>}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-card p-12 text-center shadow-card"><Bell className="h-12 w-12 text-primary-300" /><h3 className="heading-sm mt-4">{t("notifications.empty")}</h3></div>
        ) : (
          <div className="space-y-3">
            {visible.map((n) => {
              const Icon = typeIcon[n.type ?? "system"] ?? Bell;
              const date = tsToDate(n.createdAt);
              return (
                <div key={n.id} className={cn("flex items-start gap-3 rounded-2xl bg-card p-4 shadow-card transition", !n.read && "ring-1 ring-secondary-300")}>
                  <span className={cn("flex h-10 w-10 flex-none items-center justify-center rounded-xl", n.read ? "bg-primary-50 text-primary-700" : "bg-secondary-100 text-secondary-700")}><Icon className="h-5 w-5" /></span>
                  <button type="button" onClick={() => !n.read && handleRead(n.id)} className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-semibold text-primary-900">{n.title}</p>
                    <p className="text-sm text-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-muted">{date ? formatRelativeTime(date) : ""}</p>
                  </button>
                  <div className="flex flex-none items-center gap-1">
                    {!n.read && <button type="button" disabled={busy === n.id} onClick={() => handleRead(n.id)} aria-label={t("notifications.unread")} className="rounded-full p-1.5 text-secondary-600 hover:bg-secondary-50"><CheckCheck className="h-4 w-4" /></button>}
                    <button type="button" disabled={busy === n.id} onClick={() => handleDelete(n.id)} aria-label={t("notifications.delete")} className="rounded-full p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  {busy === n.id && <Loader2 className="h-4 w-4 animate-spin text-primary-700" />}
                </div>
              );
            })}
            {visible.length < items.length && <button type="button" onClick={() => setPage((p) => p + 1)} className="btn-outline mx-auto block">{t("search.loadMore")}</button>}
          </div>
        )}
      </div>
    </ProtectedLayout></AuthGuard>
  );
}
