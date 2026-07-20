"use client";
import { useState } from "react";
import { CloudUpload as UploadCloud, FileSpreadsheet, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, X, Loader as Loader2 } from "lucide-react";
import { parseCSV, detectDuplicates } from "@/lib/admin/notificationService";
import { createProfile } from "@/lib/admin/adminService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import type { ProfileDocument } from "@/firebase/schema";
import { cn } from "@/lib/utils";

interface PreviewRow { [key: string]: string | number | boolean | undefined; _row: number; _duplicate?: boolean; }

export default function BulkUploadPage() {
  const { adminUser } = useAdminAuth();
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [failed, setFailed] = useState(0);
  const admin = adminUser ? { uid: adminUser.uid, email: adminUser.email } : undefined;

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCSV(text);
    const dupes = new Set(detectDuplicates(parsed, "phone"));
    const preview = parsed.map((r, i) => ({ ...r, _row: i + 2, _duplicate: dupes.has(i) }));
    setRows(preview);
  };

  const importAll = async () => {
    setImporting(true); setImported(0); setFailed(0);
    let ok = 0, fail = 0;
    for (const r of rows) {
      try {
        const profile: Omit<ProfileDocument, "id" | "createdAt"> = {
          userId: String(r.userId ?? "bulk"), name: String(r.name ?? ""), gender: String(r.gender) === "male" ? "male" : "female", dob: String(r.dob ?? ""), religion: String(r.religion || ""), caste: String(r.caste || ""), education: String(r.education || ""), occupation: String(r.occupation || ""), phone: String(r.phone || ""), city: String(r.city || ""), district: String(r.district || ""), state: "Tamil Nadu", status: "pending", premium: false, verified: false, featured: false, createdBy: "bulk",
        };
        await createProfile(profile, admin); ok++;
      } catch { fail++; }
      setImported(ok); setFailed(fail);
    }
    setImporting(false);
  };

  const rollback = () => { setRows([]); setFileName(""); setImported(0); setFailed(0); };
  const headers = rows.length > 0 ? Object.keys(rows[0]).filter((k) => !k.startsWith("_")) : [];

  return (
    <div>
      <h1 className="heading-md">Bulk Upload</h1>
      <p className="text-lead mt-1 text-sm">Upload CSV or Excel files to import multiple profiles at once.</p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-200 p-8 text-center transition hover:border-primary-400 hover:bg-primary-50/50">
          <UploadCloud className="h-10 w-10 text-primary-400" />
          <p className="text-sm font-medium text-primary-900">Click to upload CSV/Excel</p>
          <p className="text-xs text-muted">Columns: name, gender, religion, caste, education, occupation, phone, district, dob</p>
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
        {fileName && <p className="mt-3 flex items-center gap-2 text-sm text-green-700"><FileSpreadsheet className="h-4 w-4" />{fileName} · {rows.length} rows</p>}
      </div>
      {rows.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="heading-sm">Preview &amp; Validate</h2>
            <div className="flex gap-2">
              <button type="button" onClick={importAll} disabled={importing} className="btn-primary">{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{importing ? "Importing…" : "Import"}</button>
              <button type="button" onClick={rollback} className="btn-outline"><X className="h-4 w-4" />Rollback</button>
            </div>
          </div>
          {imported > 0 || failed > 0 ? <p className="mt-2 text-sm"><span className="text-green-700">{imported} imported</span> · <span className="text-red-700">{failed} failed</span></p> : null}
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-primary-100 text-left text-muted"><th className="p-3">#</th>{headers.map((h) => <th key={h} className="p-3 capitalize">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._row} className={cn("border-b border-primary-100 last:border-0", r._duplicate && "bg-amber-50/50")}>
                    <td className="p-3 text-xs text-muted">{r._row}{r._duplicate && <AlertTriangle className="ml-1 inline h-3 w-3 text-amber-500" />}</td>
                    {headers.map((h) => <td key={h} className="p-3 text-xs">{String(r[h] ?? "—")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
