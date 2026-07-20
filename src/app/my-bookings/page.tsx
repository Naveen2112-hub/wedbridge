"use client";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { MyBookingsView } from "@/components/marketplace/MyBookingsView";

export default function Page() {
  return <RouteGuard><MyBookingsView /></RouteGuard>;
}
