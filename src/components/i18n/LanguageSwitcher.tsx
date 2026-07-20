"use client";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";
export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (<div className="inline-flex items-center rounded-full border border-primary-100 bg-white p-0.5 text-xs"><Globe className="ml-2 mr-1 h-3.5 w-3.5 text-gray-500" /><button onClick={() => setLang("en")} className={cn("rounded-full px-2.5 py-1 font-medium transition", lang === "en" ? "bg-primary-600 text-white" : "text-gray-500 hover:text-primary-900")}>EN</button><button onClick={() => setLang("ta")} className={cn("rounded-full px-2.5 py-1 font-medium transition", lang === "ta" ? "bg-primary-600 text-white" : "text-gray-500 hover:text-primary-900")}>த</button></div>);
}
