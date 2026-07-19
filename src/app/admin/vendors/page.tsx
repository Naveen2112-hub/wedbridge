"use client";

import { Store } from "lucide-react";
import { AdminPage } from "@/components/auth/AdminPage";

export default function AdminVendorsPage() {
  return (<AdminPage title="Vendors" description="Manage wedding service vendors." icon={Store} />);
}
