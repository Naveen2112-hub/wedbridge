"use client";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

export default function Page() {
  return <RouteGuard><ProfileEditForm /></RouteGuard>;
}
