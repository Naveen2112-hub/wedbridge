import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

export const metadata: Metadata = { title: "Edit Profile", description: "Create or edit your matrimony profile." };

export default function ProfileEditPage() {
  return (
    <AppShell>
      <RouteGuard requireAuth>
        <ProfileEditForm />
      </RouteGuard>
    </AppShell>
  );
}
