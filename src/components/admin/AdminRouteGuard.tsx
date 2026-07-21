"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { Loader as Loader2 } from "lucide-react";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !adminUser && !isLoginRoute) router.replace("/admin/login");
  }, [loading, adminUser, router, isLoginRoute]);

  if (isLoginRoute) return <>{children}</>;
  if (loading || !adminUser) return <div className="flex h-screen items-center justify-center bg-primary-50"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  return <>{children}</>;
}
