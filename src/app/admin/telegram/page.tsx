"use client";
import { useState, useEffect, useCallback } from "react";
import { Send, Image as ImageIcon, FileText, Loader as Loader2, Check, X, Users, Crown, BadgeCheck, CircleUser as UserCircle, RefreshCw, Send as SendIcon } from "lucide-react";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

type TargetType = "all" | "premium" | "verified" | "specific";

interface BroadcastResult { total: number; success: number; failed: number; failedUserIds: string[] }

export default function AdminTelegramPage() {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"none" | "photo" | "document">("none");
  const [target, setTarget] = useState<TargetType>("all");
  const [specificIds, setSpecificIds] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/telegram/broadcasts");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.broadcasts ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleBroadcast = async () => {
    if (!message && !mediaUrl) { toast("Message or media URL is required", "error"); return; }
    if (target === "specific" && !specificIds.trim()) { toast("Enter at least one user ID", "error"); return; }
    setSending(true);
    setResult(null);
    try {
      const userIds = target === "specific" ? specificIds.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
      const res = await fetch("/api/telegram/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": adminUser?.uid ?? "" },
        body: JSON.stringify({
          message,
          target: { type: target, userIds },
          mediaType: mediaType === "none" ? undefined : mediaType,
          mediaUrl: mediaType !== "none" ? mediaUrl : undefined,
        }),
      });
      const data: BroadcastResult = await res.json();
      if (res.ok) {
        setResult(data);
        toast(`Broadcast complete: ${data.success} sent, ${data.failed} failed`, "success");
        setMessage("");
        setMediaUrl("");
        setMediaType("none");
        loadHistory();
      } else {
        toast("Broadcast failed", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSending(false);
    }
  };

  const handleRetry = async () => {
    if (!result || result.failedUserIds.length === 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/telegram/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": adminUser?.uid ?? "" },
        body: JSON.stringify({
          message,
          target: { type: "specific", userIds: result.failedUserIds },
        }),
      });
      const data: BroadcastResult = await res.json();
      if (res.ok) {
        setResult(data);
        toast(`Retry complete: ${data.success} sent, ${data.failed} failed`, "success");
      }
    } catch {
      toast("Retry failed", "error");
    } finally {
      setSending(false);
    }
  };

  const targets = [
    { value: "all" as TargetType, label: "All Users", icon: Users },
    { value: "premium" as TargetType, label: "Premium Users", icon: Crown },
    { value: "verified" as TargetType, label: "Verified Users", icon: BadgeCheck },
    { value: "specific" as TargetType, label: "Specific Users", icon: UserCircle },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><SendIcon className="h-6 w-6" /></span>
        <div><h1 className="heading-md">Telegram Broadcast</h1><p className="text-lead text-sm">Send announcements and updates to connected users.</p></div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Compose */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="heading-sm">Compose Message</h2>

          {/* Target */}
          <div className="mt-4">
            <label className="label">Send To</label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {targets.map((t) => (
                <button key={t.value} type="button" onClick={() => setTarget(t.value)} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition", target === t.value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-primary-200 text-gray-700 hover:bg-primary-50")}>
                  <t.icon className="h-4 w-4" />{t.label}
                </button>
              ))}
            </div>
            {target === "specific" && (
              <div className="mt-2">
                <input type="text" value={specificIds} onChange={(e) => setSpecificIds(e.target.value)} className="input" placeholder="Comma-separated user IDs: uid1, uid2, ..." />
              </div>
            )}
          </div>

          {/* Message */}
          <div className="mt-4">
            <label className="label" htmlFor="broadcast-msg">Message</label>
            <textarea id="broadcast-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input resize-none" placeholder="Type your broadcast message..." />
          </div>

          {/* Media */}
          <div className="mt-4">
            <label className="label">Media (optional)</label>
            <div className="mt-2 flex gap-2">
              {[
                { value: "none" as const, label: "None", icon: X },
                { value: "photo" as const, label: "Photo", icon: ImageIcon },
                { value: "document" as const, label: "PDF", icon: FileText },
              ].map((m) => (
                <button key={m.value} type="button" onClick={() => setMediaType(m.value)} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition", mediaType === m.value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-primary-200 text-gray-700 hover:bg-primary-50")}>
                  <m.icon className="h-4 w-4" />{m.label}
                </button>
              ))}
            </div>
            {mediaType !== "none" && (
              <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="input mt-2" placeholder="https://example.com/file.jpg" />
            )}
          </div>

          <button type="button" onClick={handleBroadcast} disabled={sending} className="btn-primary mt-4 w-full">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending..." : "Send Broadcast"}
          </button>
        </div>

        {/* Results & History */}
        <div className="space-y-6">
          {/* Progress */}
          {sending && (
            <div className="card p-6">
              <h2 className="heading-sm">Sending...</h2>
              <div className="mt-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                <p className="text-sm text-gray-500">Broadcasting in progress</p>
              </div>
            </div>
          )}

          {result && !sending && (
            <div className="card p-6">
              <h2 className="heading-sm">Broadcast Result</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
                  <span className="text-sm text-gray-700">Total Recipients</span>
                  <span className="text-lg font-bold text-primary-800">{result.total}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-success-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-success-700"><Check className="h-4 w-4" />Success</span>
                  <span className="text-lg font-bold text-success-700">{result.success}</span>
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-error-50 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-error-700"><X className="h-4 w-4" />Failed</span>
                    <span className="text-lg font-bold text-error-700">{result.failed}</span>
                  </div>
                )}
                {result.failed > 0 && (
                  <button type="button" onClick={handleRetry} className="btn-outline w-full">
                    <RefreshCw className="h-4 w-4" />Retry Failed ({result.failed})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* History */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="heading-sm">Recent Broadcasts</h2>
              <button type="button" onClick={loadHistory} className="text-gray-500 hover:text-primary-600"><RefreshCw className="h-4 w-4" /></button>
            </div>
            {loadingHistory ? (
              <div className="mt-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>
            ) : history.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No broadcasts yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {history.map((h, i) => {
                  const item = h as { text?: string; target?: string; success?: number; failed?: number; total?: number };
                  return (
                    <div key={i} className="rounded-xl border border-primary-100 px-3 py-2.5 text-sm">
                      <p className="line-clamp-2 font-medium text-gray-800">{item.text ?? "No message"}</p>
                      <div className="mt-1 flex gap-3 text-xs text-gray-500">
                        <span>Target: {item.target ?? "all"}</span>
                        <span>OK: {item.success ?? 0}</span>
                        <span>Failed: {item.failed ?? 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
