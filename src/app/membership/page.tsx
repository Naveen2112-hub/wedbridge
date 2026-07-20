import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { MembershipView } from "@/components/membership/MembershipView";

export const metadata: Metadata = { title: "Membership Plans", description: "Upgrade to Premium or Gold for unlimited access." };

export default function MembershipPage() {
  return (
    <AppShell>
      <MembershipView />
    </AppShell>
  );
}
