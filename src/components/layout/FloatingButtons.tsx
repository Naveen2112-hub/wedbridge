"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Phone, Send, X } from "lucide-react";

export function FloatingButtons() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {expanded && (
        <>
          <a href="https://wa.me/916383109341" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-green-600 animate-[fadeIn_0.2s_ease-out]"><MessageCircle className="h-5 w-5" /> WhatsApp</a>
          <a href="tel:+916383109341" className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-blue-600 animate-[fadeIn_0.2s_ease-out]"><Phone className="h-5 w-5" /> Call Us</a>
          <a href="https://t.me/wedbridge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-sky-600 animate-[fadeIn_0.2s_ease-out]"><Send className="h-5 w-5" /> Telegram</a>
        </>
      )}
      <button onClick={() => setExpanded(!expanded)} className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl transition hover:bg-rose-700 hover:scale-110" aria-label="Contact options">
        {expanded ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
