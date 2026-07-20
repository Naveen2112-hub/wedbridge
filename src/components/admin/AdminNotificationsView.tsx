"use client";
import { useEffect, useState } from "react";
import { Bell, Send, Loader as Loader2 } from "lucide-react";
import { getNotifications } from "@/lib/notifications/notificationService";
import { broadcastNotification } from "@/lib/admin/notificationService";
import type { NotificationDocument } from "@/firebase/schema";
import { formatDate, sanitizeText } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function AdminNotificationsView() {
  const { toast } = useToast();
  const [notifs, setNotifs] = useState<NotificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", target: "all" as "all" | "premium" | "free" | "vendors" });

  const load = async () => { setLoading(true); const n = await getNotifications(50); setNotifs(n); setLoading(false); };
  useEffect(() => { load(); }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) { toast("Title and message required", "error"); return; }
    setSending(true);
    await broadcastNotification({ title: sanitizeText(form.title), message: sanitizeText(form.message), target: form.target });
    setSending(false);
    setForm({ title: "", message: "", target: "all" });
    toast("Notification broadcast!", "success");
    load();
  };

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Notifications</h1><p className="text-lead mt-1 text-sm">Broadcast notifications to all users</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6"><h2 className="heading-sm flex items-center gap-2"><Send className="h-5 w-5 text-primary-600" />New Broadcast</h2>
          <form onSubmit={send} className="mt-4 space-y-3">
            <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={100} /></div>
            <div><label className="label">Message</label><textarea className="input" rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} maxLength={500} /></div>
            <div><label className="label">Target Audience</label><select className="input" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value as "all" | "premium" | "free" | "vendors" }))}><option value="all">All Users</option><option value="premium">Premium Members</option><option value="free">Free Members</option><option value="vendors">Vendors</option></select></div>
            <button type="submit" disabled={sending} className="btn-primary w-full">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Broadcast"}</button>
          </form>
        </div>
        <div className="card p-6"><h2 className="heading-sm flex items-center gap-2"><Bell className="h-5 w-5 text-primary-600" />Recent</h2>
          {loading ? <div className="mt-3 space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}</div> : (
            <div className="mt-3 space-y-2">{notifs.length === 0 ? <p className="text-sm text-gray-500">No notifications sent.</p> : notifs.map((n) => <div key={n.id} className="border-b border-primary-50 pb-2"><p className="font-medium text-primary-900">{n.title}</p><p className="text-sm text-gray-500">{n.message}</p><p className="text-xs text-gray-500">{formatDate(n.createdAt as unknown as string)}</p></div>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
