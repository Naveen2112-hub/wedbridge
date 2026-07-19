"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) router.replace("/login");
  }, [user, loading, configured, router]);

  if (!configured) {
    return (<div className="flex min-h-[60vh] items-center justify-center bg-grain"><p className="text-sm text-muted">Firebase is not configured.</p></div>);
  }
  if (loading || !user) {
    return (<div className="flex min-h-[60vh] items-center justify-center bg-grain"><Loader2 className="h-8 w-8 animate-spin text-primary-800" /></div>);
  }
  return <>{children}</>;
}
