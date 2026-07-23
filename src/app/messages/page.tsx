"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader as Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

interface ChatMessage { id: string; senderId: string; receiverId: string; text: string; createdAt: number; read: boolean; }
interface Conversation { peerId: string; peerName: string; lastMessage: string; unread: number; }

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
  useEffect(() => { if (!user) return; setConversations([]); }, [user]);
  useEffect(() => { if (!activePeer) return; setMessages([]); }, [activePeer]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !activePeer) return;
    setSending(true);
    const msg: ChatMessage = { id: Math.random().toString(36).slice(2), senderId: user.uid, receiverId: activePeer, text: input.trim(), createdAt: Date.now(), read: false };
    setMessages((m) => [...m, msg]);
    setInput("");
    setSending(false);
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-rose-600" /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-neutral-900">Messages</h1><p className="mt-1 text-sm text-neutral-500">Chat with your accepted connections</p></div>
      <div className="grid h-[600px] gap-4 lg:grid-cols-3">
        <div className="overflow-y-auto rounded-2xl border border-neutral-200 bg-white lg:col-span-1">
          {conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="h-12 w-12 text-neutral-300" />
              <p className="mt-3 text-sm text-neutral-500">No conversations yet</p>
              <p className="mt-1 text-xs text-neutral-400">Accept an interest to start chatting</p>
            </div>
          ) : conversations.map((c) => (
            <button key={c.peerId} onClick={() => setActivePeer(c.peerId)} className={`flex w-full items-center gap-3 border-b border-neutral-100 p-4 text-left transition hover:bg-neutral-50 ${activePeer === c.peerId ? "bg-rose-50" : ""}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">{c.peerName.charAt(0)}</span>
              <div className="flex-1 overflow-hidden"><p className="truncate text-sm font-medium text-neutral-900">{c.peerName}</p><p className="truncate text-xs text-neutral-500">{c.lastMessage}</p></div>
              {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">{c.unread}</span>}
            </button>
          ))}
        </div>
        <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white lg:col-span-2">
          {activePeer ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-neutral-400">Start a conversation</div> :
                  <div className="space-y-2">{messages.map((m) => <div key={m.id} className={`flex ${m.senderId === user?.uid ? "justify-end" : "justify-start"}`}><div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.senderId === user?.uid ? "bg-rose-600 text-white" : "bg-neutral-100 text-neutral-900"}`}>{m.text}</div></div>)}<div ref={messagesEndRef} /></div>}
              </div>
              <form onSubmit={handleSend} className="border-t border-neutral-100 p-4">
                <div className="flex items-center gap-2">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none" />
                  <button type="submit" disabled={sending || !input.trim()} className="rounded-xl bg-rose-600 p-2.5 text-white transition hover:bg-rose-500 disabled:opacity-60"><Send className="h-5 w-5" /></button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center"><MessageCircle className="h-16 w-16 text-neutral-200" /><p className="mt-4 text-sm text-neutral-500">Select a conversation to start chatting</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
