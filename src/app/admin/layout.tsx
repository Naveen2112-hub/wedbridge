"use client";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminAuthProvider } from "@/lib/admin/AdminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider><AdminRouteGuard><AdminLayout>{children}</AdminLayout></AdminRouteGuard></AdminAuthProvider>;
}
