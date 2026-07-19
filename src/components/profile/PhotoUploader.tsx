"use client";
import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Upload, Loader2, Check, X } from "lucide-react";
import { compressImage, dataURLtoBlob, uploadProfilePhoto, MAX_PHOTO_BYTES } from "@/lib/profile/profileService";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/cn";

interface PhotoUploaderProps { uid: string; value?: string; onChange: (url: string) => void; }
type Phase = "idle" | "cropping" | "compressing" | "uploading" | "done" | "error";

export function PhotoUploader({ uid, value, onChange }: PhotoUploaderProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const onFile = useCallback(async (file: File) => {
    setError(null);
    if (file.size > MAX_PHOTO_BYTES) { setError(t("profile.maxSize")); return; }
    const reader = new FileReader();
    reader.onload = () => { setImageSrc(reader.result as string); setPhase("cropping"); };
    reader.readAsDataURL(file);
  }, [t]);

  const onCropComplete = useCallback((_: unknown, area: { x: number; y: number; width: number; height: number }) => setCroppedArea(area), []);

  const applyCrop = useCallback(async () => {
    if (!imageSrc || !croppedArea) return;
    setPhase("compressing");
    try {
      const croppedDataURL = await getCroppedImg(imageSrc, croppedArea);
      const blob = dataURLtoBlob(croppedDataURL);
      const compressed = await compressImage(new File([blob], "photo.jpg", { type: "image/jpeg" }), 1024, 0.82);
      setPhase("uploading");
      const url = await uploadProfilePhoto(uid, compressed, "jpg");
      onChange(url);
      setPhase("done");
      setImageSrc(null);
      setTimeout(() => setPhase("idle"), 1500);
    } catch {
      setPhase("error"); setError(t("profile.photoFailed"));
    }
  }, [imageSrc, croppedArea, uid, onChange, t]);

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 flex-none overflow-hidden rounded-full bg-primary-50 ring-2 ring-secondary/30">
          {value ? <img src={value} alt="Profile" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-xs text-muted">No photo</span>}
        </div>
        <div>
          <label className="btn-outline cursor-pointer text-sm">
            <Upload className="h-4 w-4" />
            {value ? t("profile.changePhoto") : t("profile.uploadPhoto")}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
          </label>
          <p className="mt-1.5 text-xs text-muted">{t("profile.maxSize")}</p>
        </div>
        {phase === "done" && <span className="flex items-center gap-1 text-xs text-green-700"><Check className="h-3.5 w-3.5" />Saved</span>}
      </div>

      {error && <p className="mt-2 text-xs text-accent-700">{error}</p>}
      {(phase === "compressing" || phase === "uploading") && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" />{phase === "compressing" ? t("profile.compressing") : t("profile.uploading")}</p>
      )}

      {imageSrc && phase === "cropping" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/80 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-base font-semibold text-primary-900">{t("profile.cropPhoto")}</h3><button onClick={() => { setImageSrc(null); setPhase("idle"); }} className="rounded-full p-1.5 text-muted hover:bg-primary-50"><X className="h-4 w-4" /></button></div>
            <div className="relative h-64 w-full overflow-hidden rounded-xl bg-primary-950">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-3 w-full accent-secondary" />
            <button onClick={applyCrop} className={cn("btn-primary mt-3 w-full")}>{t("profile.crop")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

async function getCroppedImg(imageSrc: string, crop: { x: number; y: number; width: number; height: number }): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = imageSrc; });
  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.9);
}
