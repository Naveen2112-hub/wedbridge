"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { Loader as Loader2 } from "lucide-react";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !adminUser) router.replace("/admin/login");
  }, [loading, adminUser, router]);

  if (loading || !adminUser) return <div className="flex h-screen items-center justify-center bg-primary-50"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  return <>{children}</>;
}
