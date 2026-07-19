"use client";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";
export function LanguageSwitcher() {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === language) ?? languages[0];
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-white/70 px-3 py-2 text-xs font-semibold text-primary-900 transition hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" aria-haspopup="listbox" aria-expanded={open}>
        <span className="text-sm">{current.nativeLabel}</span><ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-primary-100 bg-white py-1 shadow-card" role="listbox">
          {languages.map((l) => (<li key={l.code}><button type="button" onClick={() => { setLanguage(l.code); setOpen(false); }} className={cn("flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-primary-50", language === l.code ? "text-primary-900" : "text-ink/70")} role="option" aria-selected={language === l.code}><span>{l.nativeLabel}</span>{language === l.code && <Check className="h-4 w-4 text-secondary-600" />}</button></li>))}
        </ul>
      )}
    </div>
  );
}
