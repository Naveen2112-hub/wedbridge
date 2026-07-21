"use client";
import { useCallback, useRef, useState } from "react";
import { FileText, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, CircleAlert as AlertTriangle, RotateCw, Upload, Pencil } from "lucide-react";
import { runOCR } from "@/lib/profile/ocr";
import type { PartialProfile, ProfileWithConfidence, FieldKey } from "@/lib/profile/ocrTypes";
import { autofillFields, reviewFields, missingFields, confidenceLevel } from "@/lib/profile/ocrTypes";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface OCRUploaderProps {
  onExtract: (data: PartialProfile) => void;
  onConfidence?: (data: ProfileWithConfidence) => void;
}

type Phase = "idle" | "uploading" | "preprocessing" | "removingPhoto" | "removingHoroscope" | "removingLogos" | "runningOCR" | "extracting" | "autofilling" | "done" | "error" | "partial";

const STEPS: { phase: Phase; label: string }[] = [
  { phase: "uploading", label: "stepUploading" },
  { phase: "preprocessing", label: "stepPreprocessing" },
  { phase: "removingPhoto", label: "stepRemovingPhoto" },
  { phase: "removingHoroscope", label: "stepRemovingHoroscope" },
  { phase: "removingLogos", label: "stepRemovingLogos" },
  { phase: "runningOCR", label: "stepRunningOCR" },
  { phase: "extracting", label: "stepExtracting" },
  { phase: "autofilling", label: "stepAutofilling" },
];

function stepFromProgress(p: number): Phase {
  if (p < 0.05) return "uploading";
  if (p < 0.40) return "preprocessing";
  if (p < 0.50) return "removingPhoto";
  if (p < 0.55) return "removingHoroscope";
  if (p < 0.60) return "removingLogos";
  if (p < 0.80) return "runningOCR";
  if (p < 0.95) return "extracting";
  return "autofilling";
}

function confidenceColor(level: "high" | "medium" | "low"): string {
  if (level === "high") return "bg-green-100 text-green-800";
  if (level === "medium") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function confidenceText(level: "high" | "medium" | "low"): string {
  if (level === "high") return "";
  return "needs review";
}

export function OCRUploader({ onExtract, onConfidence }: OCRUploaderProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("");
  const [summary, setSummary] = useState<{ high: number; review: number; missing: number } | null>(null);
  const [fieldDetails, setFieldDetails] = useState<{ key: FieldKey; value: string; confidence: number; level: "high" | "medium" | "low" }[]>([]);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [existingConfidence, setExistingConfidence] = useState<ProfileWithConfidence>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(async (file: File, preserveExisting: boolean = false) => {
    setPhase("uploading");
    setProgress(0);
    setSummary(null);
    setFieldDetails([]);
    setLastFile(file);

    const existing = preserveExisting ? existingConfidence : {};

    try {
      const { withConfidence } = await runOCR(file, (step, p) => {
        setProgress(Math.round(p * 100));
        setStepLabel(step);
        const s = stepFromProgress(p);
        setPhase(s);
      }, existing);

      const extractedCount = Object.values(withConfidence).filter((f) => f && f.value).length;

      if (extractedCount === 0) {
        setPhase("error");
        return;
      }

      setExistingConfidence(withConfidence);
      const auto = autofillFields(withConfidence);
      onExtract(auto);
      onConfidence?.(withConfidence);

      const high = Object.values(withConfidence).filter((f) => f && f.level === "high").length;
      const review = reviewFields(withConfidence).length;
      const missing = missingFields(withConfidence).length;
      setSummary({ high, review, missing });

      const details = (Object.entries(withConfidence) as [FieldKey, { value: string; confidence: number; level: "high" | "medium" | "low" }][])
        .filter(([, f]) => f && f.value)
        .map(([key, f]) => ({ key, value: f.value, confidence: f.confidence, level: f.level }));
      setFieldDetails(details);

      if (missing === 0 && review === 0) {
        setPhase("done");
      } else {
        setPhase("partial");
      }
    } catch {
      setPhase("error");
    }
  }, [onExtract, onConfidence, existingConfidence]);

  const onRetry = useCallback(() => {
    if (lastFile) handle(lastFile, true);
  }, [lastFile, handle]);

  const onUploadAnother = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onManualEntry = useCallback(() => {
    setPhase("idle");
    setSummary(null);
    setFieldDetails([]);
  }, []);

  const busy = phase !== "idle" && phase !== "done" && phase !== "error" && phase !== "partial";
  const showFailure = phase === "error";
  const showSuccess = phase === "done" || phase === "partial";

  return (
    <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary-100 text-secondary-800"><FileText className="h-5 w-5" /></span>
        <div className="flex-1">
          <h4 className="font-display text-sm font-semibold text-primary-900">{t("profile.ocr.title")}</h4>
          <p className="text-xs text-gray-500">{t("profile.ocr.subtitle")}</p>
          <p className="mt-0.5 text-[10px] text-gray-400">{t("profile.ocr.supportedFormats")}</p>
        </div>
      </div>

      <label className="btn-outline mt-3 w-full cursor-pointer text-sm">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        {t("profile.ocr.upload")}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,image/heic,image/heif"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f, false); e.currentTarget.value = ""; }}
          disabled={busy}
        />
      </label>

      {busy && (
        <div className="mt-4 space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary-100">
            <div className="h-full rounded-full bg-secondary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-1">
            {STEPS.map((s, i) => {
              const stepProgress = ((i + 1) / STEPS.length) * 100;
              const isDone = progress >= stepProgress;
              const isCurrent = stepFromProgress(progress / 100) === s.phase;
              return (
                <div key={s.phase} className="flex items-center gap-2 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 flex-none text-green-600" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 flex-none animate-spin text-secondary-600" />
                  ) : (
                    <div className="h-3.5 w-3.5 flex-none rounded-full border border-gray-300" />
                  )}
                  <span className={isCurrent ? "font-medium text-primary-900" : isDone ? "text-gray-500" : "text-gray-400"}>
                    {t(`profile.ocr.${s.label}`)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500">{stepLabel} ({progress}%)</p>
        </div>
      )}

      {showSuccess && summary && (
        <div className="mt-4 space-y-3">
          <p className="flex items-center gap-1.5 text-xs text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {phase === "done" ? t("profile.ocr.completeSuccess") : t("profile.ocr.partialSuccess")}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-green-50 px-2 py-1 text-green-800">{summary.high} {t("profile.ocr.autofilled")}</span>
            {summary.review > 0 && (
              <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-amber-800">
                <AlertTriangle className="h-3 w-3" />{summary.review} {t("profile.ocr.needReview")}
              </span>
            )}
            {summary.missing > 0 && (
              <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-600">{summary.missing} {t("profile.ocr.notFound")}</span>
            )}
          </div>

          {fieldDetails.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-primary-100 bg-white p-2">
              <div className="space-y-1">
                {fieldDetails.map((f) => (
                  <div key={f.key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-primary-900">{f.key}</span>
                    <div className="flex items-center gap-2">
                      <span className="truncate text-gray-600" title={f.value}>{f.value.length > 30 ? f.value.slice(0, 30) + "…" : f.value}</span>
                      <span className={`flex-none rounded px-1.5 py-0.5 text-[10px] font-semibold ${confidenceColor(f.level)}`}>
                        {Math.round(f.confidence * 100)}%
                      </span>
                      {f.level !== "high" && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {confidenceText(f.level)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "partial" && (
            <button type="button" onClick={onRetry} className="btn-outline w-full text-xs">
              <RotateCw className="h-3.5 w-3.5" />{t("profile.ocr.retry")}
            </button>
          )}
        </div>
      )}

      {showFailure && (
        <div className="mt-4 space-y-3">
          <p className="flex items-center gap-1.5 text-xs text-accent-700">
            <AlertCircle className="h-3.5 w-3.5" />{t("profile.ocr.failed")}
          </p>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={onRetry} className="btn-outline w-full text-xs">
              <RotateCw className="h-3.5 w-3.5" />{t("profile.ocr.retry")}
            </button>
            <button type="button" onClick={onUploadAnother} className="btn-outline w-full text-xs">
              <Upload className="h-3.5 w-3.5" />{t("profile.ocr.uploadAnother")}
            </button>
            <button type="button" onClick={onManualEntry} className="btn-outline w-full text-xs">
              <Pencil className="h-3.5 w-3.5" />{t("profile.ocr.manualEntry")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
