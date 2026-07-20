import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { VendorDetailView } from "@/components/marketplace/VendorDetailView";

export const metadata: Metadata = { title: "Vendor Profile", description: "View wedding vendor details and book their services." };

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AppShell>
      <VendorDetailView idPromise={params} />
    </AppShell>
  );
}
