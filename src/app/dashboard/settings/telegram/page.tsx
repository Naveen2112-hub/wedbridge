"use client";
import { useState, useEffect, useCallback } from "react";
import { Send, Check, Loader as Loader2, Copy, RefreshCw, Link as LinkIcon, Shield, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

export default function TelegramSettingsPage() {
  return (
    <AuthGuard>
      <ProtectedLayout>
        <TelegramSettingsClient />
      </ProtectedLayout>
    </AuthGuard>
  );
}

function TelegramSettingsClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [detectedChatIds, setDetectedChatIds] = useState<{ chatId: string; username?: string; firstName?: string }[]>([]);
  const [showConnect, setShowConnect] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/settings", { headers: { "x-user-id": user.uid } });
      const data = await res.json();
      if (data.configured) {
        setChatId(data.chatId ?? "");
        setEnabled(data.enabled ?? false);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    if (!user) return;
    if (!botToken || !chatId) { toast("Bot Token and Chat ID are required", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/telegram/save-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.uid },
        body: JSON.stringify({ botToken, chatId, enabled }),
      });
      const data = await res.json();
      if (res.ok) { toast("Telegram settings saved", "success"); setBotToken(""); loadSettings(); }
      else toast(data.error ?? "Failed to save", "error");
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!user) return;
    setTesting(true);
    try {
      const res = await fetch("/api/telegram/test", { method: "POST", headers: { "x-user-id": user.uid } });
      const data = await res.json();
      if (res.ok) toast("Test message sent! Check your Telegram.", "success");
      else toast(data.error ?? "Test failed", "error");
    } catch {
      toast("Network error", "error");
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/telegram/connect");
      const data = await res.json();
      if (res.ok) {
        setBotUsername(data.botUsername);
        setDetectedChatIds(data.chatIds ?? []);
        setShowConnect(true);
      } else {
        toast(data.error ?? "Could not connect to bot", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setConnecting(false);
    }
  };

  const handleVerify = async (selectedChatId: string) => {
    setChatId(selectedChatId);
    setShowConnect(false);
    toast("Chat ID detected: " + selectedChatId, "success");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Send className="h-6 w-6" /></span>
        <div><h1 className="heading-md">Telegram Notifications</h1><p className="text-lead text-sm">Connect your Telegram account to receive instant notifications.</p></div>
      </div>

      {loading ? (
        <div className="card mt-6 flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Connect Telegram Button */}
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600"><LinkIcon className="h-5 w-5" /></span>
              <div><h2 className="heading-sm">Connect Telegram</h2><p className="text-caption">Automatically detect your Chat ID</p></div>
            </div>
            <button type="button" onClick={handleConnect} disabled={connecting} className="btn-outline mt-4 w-full">
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
              {connecting ? "Connecting..." : "Connect Telegram"}
            </button>

            {showConnect && botUsername && (
              <div className="mt-6 space-y-4 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Step 1: Open the bot</p>
                  <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline">
                    <LinkIcon className="h-3.5 w-3.5" />https://t.me/{botUsername}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Step 2: Press Start</p>
                  <p className="text-xs text-gray-500">Open the bot in Telegram and press the Start button.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Step 3: Click Verify</p>
                  <p className="text-xs text-gray-500">Select your Chat ID below to auto-fill.</p>
                </div>
                {detectedChatIds.length > 0 ? (
                  <div className="space-y-2">
                    {detectedChatIds.map((c) => (
                      <button key={c.chatId} type="button" onClick={() => handleVerify(c.chatId)} className="flex w-full items-center justify-between rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm transition hover:border-primary-400 hover:bg-primary-50">
                        <div><p className="font-medium text-gray-900">{c.firstName ?? c.username ?? "Unknown"}</p><p className="text-xs text-gray-500">Chat ID: {c.chatId}</p></div>
                        <Check className="h-4 w-4 text-primary-600" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700"><p>No recent messages found. Make sure you pressed Start in the bot, then click Connect again.</p></div>
                )}
              </div>
            )}
          </div>

          {/* Manual Settings */}
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Shield className="h-5 w-5" /></span>
              <div><h2 className="heading-sm">Bot Configuration</h2><p className="text-caption">Enter your bot details manually</p></div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="bot-token">Bot Token</label>
                <input id="bot-token" type="password" value={botToken} onChange={(e) => setBotToken(e.target.value)} className="input" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
                <p className="mt-1 text-xs text-gray-500">Get this from @BotFather. Stored securely in Firestore.</p>
              </div>
              <div>
                <label className="label" htmlFor="chat-id">Chat ID</label>
                <div className="flex gap-2">
                  <input id="chat-id" type="text" value={chatId} onChange={(e) => setChatId(e.target.value)} className="input" placeholder="e.g. 123456789" />
                  {chatId && <button type="button" onClick={() => { navigator.clipboard.writeText(chatId); toast("Copied", "success"); }} className="btn-outline flex-none px-3"><Copy className="h-4 w-4" /></button>}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-primary-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary-600" />
                  <div><p className="text-sm font-medium text-gray-900">Enable Notifications</p><p className="text-xs text-gray-500">Receive alerts via Telegram</p></div>
                </div>
                <button type="button" onClick={() => setEnabled(!enabled)} className={cn("relative h-6 w-11 rounded-full transition-colors", enabled ? "bg-primary-600" : "bg-primary-200")} aria-label="Toggle notifications">
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform", enabled ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}</button>
                <button type="button" onClick={handleTest} disabled={testing || !chatId} className="btn-outline flex-1">{testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Test Connection</button>
              </div>
            </div>
          </div>

          {/* Notification Types Info */}
          <div className="card p-6">
            <h2 className="heading-sm">Notification Types</h2>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { icon: "🎉", label: "New Registration" },
                { icon: "🔐", label: "Login Notification" },
                { icon: "❤️", label: "Interest Received" },
                { icon: "💍", label: "Interest Accepted" },
                { icon: "💕", label: "Match Found" },
                { icon: "💬", label: "New Message" },
                { icon: "⭐", label: "Membership Activated" },
                { icon: "📅", label: "Vendor Booking" },
                { icon: "💳", label: "Payment Success" },
                { icon: "📄", label: "OCR Complete" },
                { icon: "📢", label: "Admin Broadcast" },
                { icon: "🔑", label: "Password Reset" },
                { icon: "✅", label: "Profile Verification" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-lg bg-primary-50/50 px-3 py-2 text-sm text-gray-700">
                  <span>{item.icon}</span><span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
