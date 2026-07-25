"use client";
import { useEffect, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { Loader as Loader2, ShieldAlert } from "lucide-react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { adminUser, loading } = useAdminAuth();
  const router = useRouter();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!adminUser) {
      setDenied(true);
      const t = setTimeout(() => router.replace("/admin/login"), 1500);
      return () => clearTimeout(t);
    }
  }, [adminUser, loading, router]);

  if (loading || (!adminUser && !denied))
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-grain">
        <Loader2 className="h-8 w-8 animate-spin text-primary-800" />
      </div>
    );

  if (denied || !adminUser)
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-grain">
        <div className="mx-auto max-w-md px-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <ShieldAlert className="h-7 w-7" />
          </span>
          <h1 className="heading-md mt-5">Access Denied</h1>
          <p className="text-lead mt-2">Administrator account required. Redirecting to admin login…</p>
        </div>
      </div>
    );

  return <>{children}</>;
}
