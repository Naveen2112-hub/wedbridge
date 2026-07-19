"use client";
import { useCallback, useState } from "react";
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { runOCR } from "@/lib/profile/ocr";
import type { PartialProfile } from "@/lib/profile/ocrTypes";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface OCRUploaderProps { onExtract: (data: PartialProfile) => void; }
export function OCRUploader({ onExtract }: OCRUploaderProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"idle" | "extracting" | "done" | "error">("idle");
  const handle = useCallback(async (file: File) => {
    setPhase("extracting");
    try {
      const { data } = await runOCR(file);
      if (Object.keys(data).length === 0) { setPhase("error"); return; }
      onExtract(data); setPhase("done");
      setTimeout(() => setPhase("idle"), 2500);
    } catch { setPhase("error"); }
  }, [onExtract]);
  return (
    <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary-100 text-secondary-800"><FileText className="h-5 w-5" /></span>
        <div className="flex-1">
          <h4 className="font-display text-sm font-semibold text-primary-900">{t("profile.ocr.title")}</h4>
          <p className="text-xs text-muted">{t("profile.ocr.subtitle")}</p>
        </div>
      </div>
      <label className="btn-outline mt-3 w-full cursor-pointer text-sm">
        {phase === "extracting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        {t("profile.ocr.upload")}
        <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.currentTarget.value = ""; }} disabled={phase === "extracting"} />
      </label>
      {phase === "done" && <p className="mt-2 flex items-center gap-1.5 text-xs text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />{t("profile.ocr.applied")}</p>}
      {phase === "error" && <p className="mt-2 flex items-center gap-1.5 text-xs text-accent-700"><AlertCircle className="h-3.5 w-3.5" />{t("profile.ocr.failed")}</p>}
      {phase === "extracting" && <p className="mt-2 text-xs text-muted">{t("profile.ocr.extracting")}</p>}
    </div>
  );
}
