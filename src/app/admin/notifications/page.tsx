"use client";
import { useState } from "react";
import { Send, Loader as Loader2, CircleCheck as CheckCircle2, Users, Crown, User, Store } from "lucide-react";
import { broadcastNotification } from "@/lib/admin/notificationService";
import { cn } from "@/lib/utils";

const targets = [
  { id: "all", label: "All Users", icon: Users },
  { id: "premium", label: "Premium", icon: Crown },
  { id: "free", label: "Free", icon: User },
  { id: "vendors", label: "Vendors", icon: Store },
] as const;

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "premium" | "free" | "vendors">("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!title || !message) return;
    setSending(true);
    await broadcastNotification({ title, message, target });
    setSending(false); setSent(true);
    setTitle(""); setMessage("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Notifications</h1><p className="text-lead mt-1 text-sm">Broadcast notifications to targeted user segments.</p></div>
      <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100">
        <h2 className="heading-sm">Broadcast Notification</h2>
        <div className="mt-4 space-y-4">
          <div><label className="label">Target Audience</label><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {targets.map((t) => <button key={t.id} type="button" onClick={() => setTarget(t.id)} className={cn("flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition", target === t.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-primary-100 text-muted hover:border-primary-300")}><t.icon className="h-5 w-5" />{t.label}</button>)}
          </div></div>
          <div><label className="label" htmlFor="notif-title">Title</label><input id="notif-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" maxLength={100} /></div>
          <div><label className="label" htmlFor="notif-msg">Message</label><textarea id="notif-msg" className="input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message…" maxLength={500} /></div>
          <button type="button" onClick={send} disabled={sending || !title || !message} className="btn-primary">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : sent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}{sending ? "Sending…" : sent ? "Sent!" : "Send Broadcast"}</button>
        </div>
      </div>
    </div>
  );
}
