"use client";
import { useState } from "react";
import { Database, Download, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { createBackup, exportCollectionAsJSON, type BackupResult, type BackupProgress } from "@/lib/admin/backupService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";

export default function BackupPage() {
  const { adminUser } = useAdminAuth();
  const [result, setResult] = useState<BackupResult | null>(null);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportingCol, setExportingCol] = useState<string | null>(null);

  const handleBackup = async () => {
    if (!adminUser) return;
    setLoading(true); setResult(null);
    const r = await createBackup(adminUser.uid, adminUser.email ?? "", (p) => setProgress(p));
    setResult(r); setLoading(false);
  };

  const handleExportJSON = async (colName: string) => {
    setExportingCol(colName);
    const json = await exportCollectionAsJSON(colName);
    if (typeof window !== "undefined") {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `${colName}-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    }
    setExportingCol(null);
  };

  const collections = ["users", "profiles", "vendors", "vendorBookings", "payments", "subscriptions", "interests", "notifications", "auditLog", "ocr_imports"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-md flex items-center gap-2"><Database className="h-6 w-6 text-primary-700" />Database Backup</h1>
        <p className="text-lead mt-1 text-sm">Create backups and export collection data for recovery purposes.</p>
      </div>
      <div className="card mb-6 p-6">
        <h2 className="heading-sm mb-2">Full Backup Summary</h2>
        <p className="mb-4 text-sm text-gray-500">Scans all collections and reports document counts. Does not modify any data.</p>
        <button type="button" onClick={handleBackup} disabled={loading} className="flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{loading ? "Scanning..." : "Run Backup Scan"}
        </button>
        {progress && loading && <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="h-3 w-3 animate-spin" />Scanning: {progress.collection} ({progress.current}/{progress.total})</div>}
        {result && (
          <div className="mt-6">
            <div className={`flex items-center gap-2 mb-4 ${result.success ? "text-green-600" : "text-red-600"}`}>
              {result.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <span className="font-medium">{result.success ? `Backup scan complete - ${result.totalDocuments} total documents` : result.error ?? "Backup failed"}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {result.collections.map((c) => <div key={c.name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-2"><span className="text-sm font-medium text-gray-700">{c.name}</span><span className="text-sm text-gray-500">{c.count} docs</span></div>)}
            </div>
          </div>
        )}
      </div>
      <div className="card p-6">
        <h2 className="heading-sm mb-2">Export Individual Collections (JSON)</h2>
        <p className="mb-4 text-sm text-gray-500">Download a full JSON export of any collection for offline backup.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => <button key={col} type="button" onClick={() => handleExportJSON(col)} disabled={exportingCol === col} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"><span>{col}</span>{exportingCol === col ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}</button>)}
        </div>
      </div>
    </div>
  );
}
