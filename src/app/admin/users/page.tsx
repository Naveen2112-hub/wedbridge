"use client";

import { Users } from "lucide-react";
import { AdminPage } from "@/components/auth/AdminPage";

export default function AdminUsersPage() {
  return (<AdminPage title="Users" description="Manage registered users and their roles." icon={Users} />);
}
