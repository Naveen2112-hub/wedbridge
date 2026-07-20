"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Info, X, Loader as Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "loading";
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextType { toast: (message: string, type?: ToastType) => void; dismiss: (id: string) => void; }
const ToastContext = createContext<ToastContextType>({ toast: () => {}, dismiss: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    if (type !== "loading") setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);
  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col gap-2 sm:bottom-6 sm:right-6" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.type === "error" ? "alert" : "status"} className={cn("pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1", t.type === "success" && "bg-green-600 text-white ring-green-700", t.type === "error" && "bg-red-600 text-white ring-red-700", t.type === "info" && "bg-primary-700 text-white ring-primary-800", t.type === "loading" && "bg-white text-ink ring-primary-200")}>
            {t.type === "success" && <CheckCircle2 className="h-4 w-4 flex-none" />}
            {t.type === "error" && <AlertCircle className="h-4 w-4 flex-none" />}
            {t.type === "info" && <Info className="h-4 w-4 flex-none" />}
            {t.type === "loading" && <Loader2 className="h-4 w-4 animate-spin flex-none" />}
            <span>{t.message}</span>
            {t.type !== "loading" && <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="ml-2 opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() { return useContext(ToastContext); }
