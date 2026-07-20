import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { VendorDashboardView } from "@/components/marketplace/VendorDashboardView";

export const metadata: Metadata = { title: "Vendor Dashboard", description: "Manage your vendor profile and bookings." };

export default function VendorDashboardPage() {
  return (
    <AppShell>
      <RouteGuard requireAuth>
        <VendorDashboardView />
      </RouteGuard>
    </AppShell>
  );
}
