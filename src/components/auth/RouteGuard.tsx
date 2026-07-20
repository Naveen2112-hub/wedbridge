"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Loader as Loader2 } from "lucide-react";

export function RouteGuard({ children, requireAuth = true }: { children: React.ReactNode; requireAuth?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (loading) return; if (requireAuth && !user) router.replace("/login?redirect=" + encodeURIComponent(window.location.pathname)); if (!requireAuth && user) router.replace("/search"); }, [user, loading, requireAuth, router]);
  if (loading || (requireAuth && !user)) return <div className="flex min-h-screen items-center justify-center bg-primary-50"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  return <>{children}</>;
}
