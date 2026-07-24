"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Shield, Mail, Phone, Loader as Loader2, User } from "lucide-react";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";

export default function AdminProfilePage() {
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 300); return () => clearTimeout(t); }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6"><h1 className="heading-md">Admin Profile</h1><p className="text-lead mt-1 text-sm">Your administrator account details</p></div>
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
            {adminUser?.photoURL ? <Image src={adminUser.photoURL} alt="Admin avatar" width={64} height={64} className="h-16 w-16 rounded-2xl object-cover" /> : <Shield className="h-8 w-8 text-primary-600" />}
          </div>
          <div><h2 className="text-lg font-bold text-primary-900">{adminUser?.name || adminUser?.email || "Administrator"}</h2><p className="text-sm text-gray-500">Administrator</p></div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 border-b border-primary-50 pb-3"><User className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-500">Name:</span><span className="text-sm font-medium text-primary-900">{adminUser?.name || "—"}</span></div>
          <div className="flex items-center gap-3 border-b border-primary-50 pb-3"><Mail className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-500">Email:</span><span className="text-sm font-medium text-primary-900">{adminUser?.email || "—"}</span></div>
          <div className="flex items-center gap-3 border-b border-primary-50 pb-3"><Phone className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-500">Phone:</span><span className="text-sm font-medium text-primary-900">{adminUser?.phone || "—"}</span></div>
          <div className="flex items-center gap-3"><Shield className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-500">Role:</span><span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">{adminUser?.role || "admin"}</span></div>
        </div>
      </div>
    </div>
  );
}
