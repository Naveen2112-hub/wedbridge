import { VendorDetailView } from "@/components/marketplace/VendorDetailView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <VendorDetailView idPromise={params} />;
}
