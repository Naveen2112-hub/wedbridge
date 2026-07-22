"use client";
import { useEffect, useState } from "react";
import { History, RefreshCw } from "lucide-react";
import { getAdminActivityLogs, formatLogAction, type AdminActivityLog } from "@/lib/admin/activityLogService";
import { formatDate } from "@/lib/utils";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminActivityLogs(100).then((l) => { setLogs(l); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="heading-md flex items-center gap-2"><History className="h-6 w-6 text-primary-700" />Activity Logs</h1>
          <p className="text-lead mt-1 text-sm">Audit trail of all admin actions on the platform.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-xl" />)}</div>
      ) : logs.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No activity logs found.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Admin</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Target</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Details</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => {
                const action = formatLogAction(log.action);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{log.adminEmail}</td>
                    <td className="px-4 py-3"><span className={`inline-block rounded-lg px-2 py-1 text-xs font-medium ${action.color}`}>{action.label}</span></td>
                    <td className="px-4 py-3 text-gray-600">{log.target}</td>
                    <td className="px-4 py-3 text-gray-500">{log.details ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(log.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
