"use client";
import { useEffect, useState } from "react";
import { Bell, Heart, Check, X, Loader as Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getUserInterests, updateInterestStatus } from "@/lib/matching/matchService";
import { getNotifications } from "@/lib/notifications/notificationService";
import type { InterestDocument, NotificationDocument } from "@/firebase/schema";
import { formatDate } from "@/lib/utils";

export function NotificationsView() {
  const { user } = useAuth();
  const [interests, setInterests] = useState<InterestDocument[]>([]);
  const [notifs, setNotifs] = useState<NotificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const [i, n] = await Promise.all([getUserInterests(user.uid), getNotifications(20)]);
      setInterests(i); setNotifs(n); setLoading(false);
    })();
  }, [user]);

  const act = async (id: string, status: "accepted" | "rejected") => {
    setActing(id);
    await updateInterestStatus(id, status);
    setInterests((prev) => prev.map((x) => x.id === id ? { ...x, status } : x));
    setActing(null);
  };

  if (loading) return <div className="px-4 py-8"><div className="skeleton h-32 w-full rounded-2xl" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="heading-md flex items-center gap-2"><Bell className="h-6 w-6 text-primary-600" />Notifications</h1>

      {interests.length > 0 && (
        <div className="mt-6">
          <h2 className="heading-sm">Interests Received</h2>
          <div className="mt-3 space-y-3">
            {interests.map((i) => (
              <div key={i.id} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700"><Heart className="h-5 w-5" /></span>
                  <div><p className="font-medium text-primary-900">{i.fromUserName}</p><p className="text-xs text-muted">{formatDate(i.createdAt as unknown as string)}</p>{i.message && <p className="mt-1 text-sm text-muted">&ldquo;{i.message}&rdquo;</p>}</div>
                </div>
                {i.status === "pending" ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => act(i.id, "accepted")} disabled={acting === i.id} className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100"><Check className="h-4 w-4" /></button>
                    <button type="button" onClick={() => act(i.id, "rejected")} disabled={acting === i.id} className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"><X className="h-4 w-4" /></button>
                  </div>
                ) : <span className="badge bg-primary-50 text-primary-700 capitalize">{i.status}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {notifs.length > 0 && (
        <div className="mt-6">
          <h2 className="heading-sm">Announcements</h2>
          <div className="mt-3 space-y-3">
            {notifs.map((n) => (
              <div key={n.id} className="card p-4"><p className="font-medium text-primary-900">{n.title}</p><p className="mt-1 text-sm text-muted">{n.message}</p><p className="mt-1 text-xs text-muted">{formatDate(n.createdAt as unknown as string)}</p></div>
            ))}
          </div>
        </div>
      )}

      {interests.length === 0 && notifs.length === 0 && (
        <div className="mt-8 rounded-2xl bg-white p-12 text-center text-muted"><Bell className="mx-auto h-10 w-10 text-primary-300" /><p className="mt-3">No notifications yet.</p></div>
      )}
    </div>
  );
}
