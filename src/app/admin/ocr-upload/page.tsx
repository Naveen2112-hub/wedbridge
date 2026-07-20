"use client";
import { useState } from "react";
import { ScanLine, FileText, Image as ImageIcon, Loader as Loader2, CircleCheck as CheckCircle2, Save } from "lucide-react";
import { mockOCR, type OCRResult } from "@/lib/admin/notificationService";
import { createProfile } from "@/lib/admin/adminService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import type { ProfileDocument } from "@/firebase/schema";

export default function OCRUploadPage() {
  const { adminUser } = useAdminAuth();
  const [result, setResult] = useState<OCRResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const admin = adminUser ? { uid: adminUser.uid, email: adminUser.email } : undefined;

  const handleFile = async (file: File) => {
    setFileName(file.name); setResult(null); setSaved(false);
    setExtracting(true);
    await new Promise((r) => setTimeout(r, 800));
    setResult(mockOCR(file.name));
    setExtracting(false);
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    const profile: Omit<ProfileDocument, "id" | "createdAt"> = {
      uid: "admin", userId: "admin", name: result.name, gender: "male", dob: result.dob, dateOfBirth: result.dob, religion: result.religion, caste: result.caste, education: result.education, occupation: result.occupation, phone: result.phone, district: result.district, state: "Tamil Nadu", status: "pending", premium: false, verified: false, featured: false, createdBy: "admin",
    };
    await createProfile(profile, admin);
    setSaving(false); setSaved(true);
  };

  const fields: { key: keyof OCRResult; label: string }[] = [
    { key: "name", label: "Name" }, { key: "dob", label: "Date of Birth" }, { key: "religion", label: "Religion" }, { key: "caste", label: "Caste" }, { key: "education", label: "Education" }, { key: "occupation", label: "Occupation" }, { key: "phone", label: "Phone" }, { key: "district", label: "District" },
  ];

  return (
    <div>
      <h1 className="heading-md">OCR Import</h1>
      <p className="text-lead mt-1 text-sm">Upload PDF, JPG, or PNG to extract profile data automatically.</p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-200 p-8 text-center transition hover:border-primary-400 hover:bg-primary-50/50">
          <ScanLine className="h-10 w-10 text-primary-400" />
          <p className="text-sm font-medium text-primary-900">Upload document for OCR</p>
          <p className="text-xs text-muted">Supports PDF, JPG, PNG</p>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
        {fileName && <p className="mt-3 flex items-center gap-2 text-sm text-primary-900">{fileName.endsWith(".pdf") ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}{fileName}</p>}
        {extracting && <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" />Extracting data…</p>}
      </div>
      {result && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100">
          <div className="flex items-center justify-between">
            <h2 className="heading-sm">Extracted Data — Preview before Save</h2>
            {saved && <span className="badge bg-green-50 text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />Saved</span>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {fields.map((f) => <div key={f.key}><label className="label">{f.label}</label><input className="input" value={result[f.key]} onChange={(e) => setResult({ ...result, [f.key]: e.target.value })} /></div>)}
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={save} disabled={saving || saved} className="btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving…" : "Save Profile"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
