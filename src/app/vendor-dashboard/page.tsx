"use client";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { VendorDashboardView } from "@/components/marketplace/VendorDashboardView";

export default function Page() {
  return <RouteGuard><VendorDashboardView /></RouteGuard>;
}
