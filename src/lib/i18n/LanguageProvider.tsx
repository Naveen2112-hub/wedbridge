"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type Dictionary } from "./dictionaries";

type Lang = "en" | "ta";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
}

function readPath(dict: Dictionary, path: string): string {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

const fallbackT = (path: string) => readPath(dictionaries.en as Dictionary, path);

const defaultValue: LangCtx = { lang: "en", setLang: () => {}, t: fallbackT };

const Ctx = createContext(defaultValue);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("wedbridge:lang")
        : null;
    if (saved === "ta" || saved === "en") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined")
      window.localStorage.setItem("wedbridge:lang", l);
  }, []);

  const t = useCallback(
    (path: string) => readPath(dictionaries[lang] as Dictionary, path),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLanguage(): LangCtx {
  return useContext(Ctx);
}
