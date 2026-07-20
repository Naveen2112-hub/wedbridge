import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata: Metadata = { title: "My Profile", description: "View and manage your matrimony profile." };

export default function ProfilePage() {
  return (
    <AppShell>
      <RouteGuard requireAuth>
        <ProfileView />
      </RouteGuard>
    </AppShell>
  );
}
