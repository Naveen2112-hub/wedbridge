"use client";
import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Users, Store } from "lucide-react";
import { exportUsers, exportVendors, type ExportFormat } from "@/lib/admin/exportService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { logAdminActivity } from "@/lib/admin/activityLogService";

export default function ExportPage() {
  const { adminUser } = useAdminAuth();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: "users" | "vendors", format: ExportFormat) => {
    if (!adminUser) return;
    const key = `${type}-${format}`;
    setExporting(key);
    try {
      if (type === "users") await exportUsers(format);
      else await exportVendors(format);
      await logAdminActivity(adminUser.uid, adminUser.email ?? "", "export", type, `Exported ${type} as ${format}`);
    } catch { /* ignore */ }
    setExporting(null);
  };

  const formats: { id: ExportFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "csv", label: "CSV", icon: Download },
    { id: "excel", label: "Excel", icon: FileSpreadsheet },
    { id: "pdf", label: "PDF", icon: FileText },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-md flex items-center gap-2"><Download className="h-6 w-6 text-primary-700" />Data Export</h1>
        <p className="text-lead mt-1 text-sm">Export user and vendor data in CSV, Excel, or PDF format.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="heading-sm mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" />User Export</h2>
          <p className="mb-4 text-sm text-gray-500">Export all users with profile information including membership tier, verification status, and demographics.</p>
          <div className="flex gap-2">
            {formats.map((f) => (
              <button key={f.id} type="button" onClick={() => handleExport("users", f.id)} disabled={exporting === `users-${f.id}`} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
                <f.icon className="h-4 w-4" />{exporting === `users-${f.id}` ? "Exporting..." : f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="heading-sm mb-2 flex items-center gap-2"><Store className="h-5 w-5 text-primary-600" />Vendor Export</h2>
          <p className="mb-4 text-sm text-gray-500">Export all vendors with business details including category, pricing, ratings, and contact information.</p>
          <div className="flex gap-2">
            {formats.map((f) => (
              <button key={f.id} type="button" onClick={() => handleExport("vendors", f.id)} disabled={exporting === `vendors-${f.id}`} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
                <f.icon className="h-4 w-4" />{exporting === `vendors-${f.id}` ? "Exporting..." : f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
