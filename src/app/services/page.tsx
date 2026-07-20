import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ServicesView } from "@/components/marketplace/ServicesView";

export const metadata: Metadata = { title: "Wedding Services", description: "Browse and book trusted wedding vendors across Tamil Nadu." };

export default function ServicesPage() {
  return (
    <AppShell>
      <ServicesView />
    </AppShell>
  );
}
