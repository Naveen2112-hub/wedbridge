"use client";
import { useCallback, useState } from "react";
import { FileText, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, CircleAlert as AlertTriangle } from "lucide-react";
import { runOCR } from "@/lib/profile/ocr";
import type { PartialProfile, ProfileWithConfidence } from "@/lib/profile/ocrTypes";
import { autofillFields, reviewFields, missingFields } from "@/lib/profile/ocrTypes";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";

interface OCRUploaderProps {
  onExtract: (data: PartialProfile) => void;
  onConfidence?: (data: ProfileWithConfidence) => void;
}

export function OCRUploader({ onExtract, onConfidence }: OCRUploaderProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"idle" | "preprocessing" | "ocr" | "extracting" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("");
  const [summary, setSummary] = useState<{ high: number; review: number; missing: number } | null>(null);

  const handle = useCallback(async (file: File) => {
    setPhase("preprocessing");
    setProgress(0);
    setSummary(null);
    try {
      const { data, withConfidence } = await runOCR(file, (step, p) => {
        setProgress(Math.round(p * 100));
        setStepLabel(step);
        if (p < 0.4) setPhase("preprocessing");
        else if (p < 0.9) setPhase("ocr");
        else setPhase("extracting");
      });

      if (Object.keys(data).length === 0) {
        setPhase("error");
        return;
      }

      const auto = autofillFields(withConfidence);
      onExtract(auto);
      onConfidence?.(withConfidence);

      const high = Object.values(withConfidence).filter((f) => f && f.level === "high").length;
      const review = reviewFields(withConfidence).length;
      const missing = missingFields(withConfidence).length;
      setSummary({ high, review, missing });

      setPhase("done");
      setTimeout(() => {
        setPhase("idle");
        setSummary(null);
      }, 5000);
    } catch {
      setPhase("error");
      setTimeout(() => setPhase("idle"), 3000);
    }
  }, [onExtract, onConfidence]);

  const busy = phase === "preprocessing" || phase === "ocr" || phase === "extracting";

  return (
    <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary-100 text-secondary-800"><FileText className="h-5 w-5" /></span>
        <div className="flex-1">
          <h4 className="font-display text-sm font-semibold text-primary-900">{t("profile.ocr.title")}</h4>
          <p className="text-xs text-gray-500">{t("profile.ocr.subtitle")}</p>
        </div>
      </div>

      <label className="btn-outline mt-3 w-full cursor-pointer text-sm">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        {t("profile.ocr.upload")}
        <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.currentTarget.value = ""; }} disabled={busy} />
      </label>

      {busy && (
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-100">
            <div className="h-full rounded-full bg-secondary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500">{stepLabel} ({progress}%)</p>
        </div>
      )}

      {phase === "done" && summary && (
        <div className="mt-3 space-y-2">
          <p className="flex items-center gap-1.5 text-xs text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />{t("profile.ocr.applied")}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-green-50 px-2 py-1 text-green-800">{summary.high} autofilled</span>
            {summary.review > 0 && (
              <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-amber-800"><AlertTriangle className="h-3 w-3" />{summary.review} need review</span>
            )}
            {summary.missing > 0 && (
              <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-600">{summary.missing} not found</span>
            )}
          </div>
        </div>
      )}

      {phase === "error" && <p className="mt-2 flex items-center gap-1.5 text-xs text-accent-700"><AlertCircle className="h-3.5 w-3.5" />{t("profile.ocr.failed")}</p>}
    </div>
  );
}
