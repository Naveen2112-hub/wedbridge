import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin Login | WedBridge" };

export default function Page() {
  return <AdminLoginForm />;
}
