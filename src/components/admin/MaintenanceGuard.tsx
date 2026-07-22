"use client";
import { useEffect, useState, type ReactNode } from "react";
import { getMaintenanceState, type MaintenanceState } from "@/lib/admin/maintenanceService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { Wrench, Clock } from "lucide-react";

export function MaintenanceGuard({ children }: { children: ReactNode }) {
  const { adminUser } = useAdminAuth();
  const [state, setState] = useState<MaintenanceState | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getMaintenanceState().then((s) => { setState(s); setChecked(true); });
  }, []);

  if (!checked) return <>{children}</>;
  if (!state?.enabled) return <>{children}</>;
  if (adminUser) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF7] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
          <Wrench className="h-10 w-10 text-primary-700" />
        </div>
        <h1 className="heading-lg mb-3 text-primary-900">Under Maintenance</h1>
        <p className="text-lead mb-6 text-gray-600">{state.message}</p>
        {state.estimatedEnd && (
          <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />Estimated end: {new Date(state.estimatedEnd).toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </div>
  );
}
