"use client";

import { FileText } from "lucide-react";
import { AdminPage } from "@/components/auth/AdminPage";

export default function AdminProfilesPage() {
  return <AdminPage title="Profiles" description="Review and approve matrimony profiles." icon={FileText} />;
}
