import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { SearchView } from "@/components/search/SearchView";

export const metadata: Metadata = { title: "Search Profiles", description: "Search and filter matrimony profiles across Tamil Nadu." };

export default function SearchPage() {
  return (
    <AppShell>
      <SearchView />
    </AppShell>
  );
}
