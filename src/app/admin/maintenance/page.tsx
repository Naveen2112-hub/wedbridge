"use client";
import { useEffect, useState } from "react";
import { Shield, Power, AlertTriangle, Clock } from "lucide-react";
import { getMaintenanceState, enableMaintenance, disableMaintenance, type MaintenanceState } from "@/lib/admin/maintenanceService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { logAdminActivity } from "@/lib/admin/activityLogService";

export default function MaintenancePage() {
  const { adminUser } = useAdminAuth();
  const [state, setState] = useState<MaintenanceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("We are performing scheduled maintenance. We'll be back shortly.");
  const [estimatedEnd, setEstimatedEnd] = useState("");
  useEffect(() => { getMaintenanceState().then((s) => { setState(s); if (s.message) setMessage(s.message); setLoading(false); }); }, []);
  const handleToggle = async () => {
    if (!adminUser) return;
    setSaving(true);
    try {
      if (state?.enabled) { await disableMaintenance(); await logAdminActivity(adminUser.uid, adminUser.email ?? "", "update", "maintenance", "Disabled maintenance mode"); setState({ ...state, enabled: false }); }
      else { await enableMaintenance(message, estimatedEnd, adminUser.uid); await logAdminActivity(adminUser.uid, adminUser.email ?? "", "update", "maintenance", "Enabled maintenance mode"); setState({ ...state, enabled: true, message, estimatedEnd, startedAt: new Date().toISOString() } as MaintenanceState); }
    } catch { /* ignore */ }
    setSaving(false);
  };
  if (loading) return <div className="skeleton h-64 w-full rounded-2xl" />;
  return (
    <div>
      <div className="mb-6"><h1 className="heading-md flex items-center gap-2"><Shield className="h-6 w-6 text-primary-700" />Maintenance Mode</h1><p className="text-lead mt-1 text-sm">Toggle maintenance mode to temporarily disable access to the platform.</p></div>
      <div className={`card mb-6 p-6 ${state?.enabled ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50"}`}>
        <div className="flex items-center gap-3">
          {state?.enabled ? <AlertTriangle className="h-8 w-8 text-amber-600" /> : <Power className="h-8 w-8 text-green-600" />}
          <div><p className="font-display text-lg font-bold text-primary-900">{state?.enabled ? "Maintenance Mode is Active" : "Platform is Operational"}</p><p className="text-sm text-gray-500">{state?.enabled ? "Users will see a maintenance page instead of the platform." : "All users can access the platform normally."}</p></div>
        </div>
      </div>
      <div className="card p-6">
        <h2 className="heading-sm mb-4">Configuration</h2>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Maintenance Message</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Estimated End Time</label><input type="datetime-local" value={estimatedEnd} onChange={(e) => setEstimatedEnd(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none" /></div>
          <button type="button" onClick={handleToggle} disabled={saving} className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition ${state?.enabled ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"} ${saving ? "opacity-50" : ""}`}><Clock className="h-4 w-4" />{saving ? "Processing..." : state?.enabled ? "Disable Maintenance" : "Enable Maintenance"}</button>
        </div>
      </div>
    </div>
  );
}
