"use client";
import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setShow(true);
  }, []);
  const accept = () => { localStorage.setItem("cookie-consent", "accepted"); setShow(false); };
  const decline = () => { localStorage.setItem("cookie-consent", "declined"); setShow(false); };
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[150] mx-auto max-w-2xl rounded-2xl bg-white p-4 shadow-xl ring-1 ring-primary-200 sm:left-6 sm:right-6">
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 flex-none text-primary-600" />
        <div className="flex-1">
          <p className="text-sm text-gray-900/80">We use cookies to improve your experience and analyze site traffic. By continuing, you agree to our Cookie Policy.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={accept} className="btn-primary text-sm">Accept</button>
            <button type="button" onClick={decline} className="btn-outline text-sm">Decline</button>
          </div>
        </div>
      </div>
    </div>
  );
}
