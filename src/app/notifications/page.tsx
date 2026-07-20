import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { NotificationsView } from "@/components/notifications/NotificationsView";

export const metadata: Metadata = { title: "Notifications", description: "View your notifications and interests." };

export default function NotificationsPage() {
  return (
    <AppShell>
      <RouteGuard requireAuth>
        <NotificationsView />
      </RouteGuard>
    </AppShell>
  );
}
