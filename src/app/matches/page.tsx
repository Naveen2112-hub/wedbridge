import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { MatchesView } from "@/components/matching/MatchesView";

export const metadata: Metadata = { title: "AI Matches", description: "AI-powered compatible profile matches." };

export default function MatchesPage() {
  return (
    <AppShell>
      <MatchesView />
    </AppShell>
  );
}
