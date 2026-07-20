import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { MyBookingsView } from "@/components/marketplace/MyBookingsView";

export const metadata: Metadata = { title: "My Bookings", description: "View your wedding vendor bookings." };

export default function MyBookingsPage() {
  return (
    <AppShell>
      <RouteGuard requireAuth>
        <MyBookingsView />
      </RouteGuard>
    </AppShell>
  );
}
