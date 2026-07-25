"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Loader as Loader2 } from "lucide-react";
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [user, loading, router]);
  if (loading || !user) return (<div className="flex min-h-[60vh] items-center justify-center bg-grain"><Loader2 className="h-8 w-8 animate-spin text-primary-800" /></div>);
  return <>{children}</>;
}
