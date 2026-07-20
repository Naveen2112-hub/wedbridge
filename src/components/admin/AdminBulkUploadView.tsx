"use client";
import { useState } from "react";
import { Upload, Loader as Loader2, Check, CircleAlert as AlertCircle } from "lucide-react";
import { parseCSV, detectDuplicates } from "@/lib/admin/notificationService";
import { createProfile } from "@/lib/admin/adminService";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";

interface PreviewRow { [key: string]: string | number | boolean | undefined; _row: number; _duplicate?: boolean; }

export function AdminBulkUploadView() {
  const { toast } = useToast();
  const { adminUser } = useAdminAuth();
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const dupeIndices = new Set(detectDuplicates(rows, "phone"));
      const withDupes: PreviewRow[] = rows.map((r, i) => ({ ...r, _row: i + 2, _duplicate: dupeIndices.has(i) }));
      setPreview(withDupes);
      toast(`${rows.length} rows parsed`, "success");
    } catch { toast("Failed to parse CSV", "error"); }
    setUploading(false);
  };

  const importRows = async () => {
    if (!adminUser) return;
    setImporting(true);
    let count = 0;
    for (const row of preview) {
      if (row._duplicate) continue;
      await createProfile({
        name: String(row.name ?? ""), gender: String(row.gender ?? "male") as "male" | "female", dob: String(row.dob ?? ""), dateOfBirth: String(row.dob ?? ""), religion: String(row.religion ?? "Hindu"),
        caste: String(row.caste ?? ""), motherTongue: String(row.motherTongue ?? "Tamil"), education: String(row.education ?? ""), occupation: String(row.occupation ?? ""),
        income: String(row.income ?? ""), phone: String(row.phone ?? ""), city: String(row.city ?? ""), district: String(row.district ?? ""), state: "Tamil Nadu",
        height: String(row.height ?? ""), weight: String(row.weight ?? ""), maritalStatus: String(row.maritalStatus ?? "never_married"), familyType: "nuclear",
        bio: String(row.bio ?? ""), userId: `bulk-${Date.now()}-${count}`, uid: `bulk-${Date.now()}-${count}`, photoURL: "", photoURLs: [], status: "pending", premium: false, verified: false, featured: false, createdBy: "bulk",
      }, { uid: adminUser.uid, email: adminUser.email });
      count++; setDone(count);
    }
    setImporting(false);
    toast(`${count} profiles imported`, "success");
    setPreview([]);
  };

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Bulk Upload</h1><p className="text-lead mt-1 text-sm">Import profiles from a CSV file</p></div>
      <div className="card p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary-200 p-12 text-center hover:border-primary-400">
          {uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary-600" /> : <><Upload className="h-8 w-8 text-primary-400" /><p className="mt-2 text-sm font-medium text-primary-900">Click to upload CSV</p><p className="text-xs text-gray-500">Columns: name, gender, dob, religion, caste, education, occupation, city, phone</p></>}
          <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>
      </div>
      {preview.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between"><h2 className="heading-sm">Preview ({preview.length} rows)</h2><button type="button" onClick={importRows} disabled={importing} className="btn-primary text-sm">{importing ? `Importing ${done}/${preview.length}…` : "Import All"}</button></div>
          <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-primary-100 text-left text-xs text-gray-500">{Object.keys(preview[0]).filter((k) => !k.startsWith("_")).map((k) => <th key={k} className="p-2 capitalize">{k}</th>)}<th className="p-2">Status</th></tr></thead><tbody>{preview.slice(0, 50).map((r) => <tr key={r._row} className="border-b border-primary-50">{Object.keys(r).filter((k) => !k.startsWith("_")).map((k) => <td key={k} className="p-2">{String(r[k] ?? "")}</td>)}<td className="p-2">{r._duplicate ? <span className="flex items-center gap-1 text-amber-600"><AlertCircle className="h-3 w-3" />Duplicate</span> : <span className="flex items-center gap-1 text-green-600"><Check className="h-3 w-3" />OK</span>}</td></tr>)}</tbody></table></div>
        </div>
      )}
    </div>
  );
}
