"use client";
import { useEffect, useState } from "react";
import { Search, Check, X, Eye, EyeOff, Trash2, Crown, BadgeCheck, Star } from "lucide-react";
import { listProfiles, updateProfile, deleteProfile } from "@/lib/admin/adminService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import type { AdminProfile } from "@/lib/admin/schema";
import { cn } from "@/lib/cn";

export default function AdminProfilesPage() {
  const { adminUser } = useAdminAuth();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "hidden">("all");

  useEffect(() => { load(); }, []);
  const load = async () => { setProfiles(await listProfiles(500)); setLoading(false); };
  const admin = adminUser ? { uid: adminUser.uid, email: adminUser.email } : undefined;

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const match = !q || p.name?.toLowerCase().includes(q) || p.phone?.includes(q);
    const f = filter === "all" ? true : p.status === filter;
    return match && f;
  });

  const act = async (p: AdminProfile, data: Partial<AdminProfile>) => { await updateProfile(p.id, data, admin); load(); };

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Profiles</h1><p className="text-lead mt-1 text-sm">Approve, verify, feature and manage profiles.</p></div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input className="input pl-10" placeholder="Search by name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="input max-w-[180px]" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-primary-100 text-left text-muted"><th className="p-3">Profile</th><th className="p-3">Gender</th><th className="p-3">Status</th><th className="p-3">Flags</th><th className="p-3">Created By</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-muted">No profiles found.</td></tr> :
            filtered.map((p) => (
              <tr key={p.id} className="border-b border-primary-100 last:border-0">
                <td className="p-3"><p className="font-medium text-primary-900">{p.name}</p><p className="text-xs text-muted">{p.religion ?? ""} · {p.district ?? ""}</p></td>
                <td className="p-3 text-xs capitalize">{p.gender}</td>
                <td className="p-3"><span className={cn("badge", p.status === "approved" ? "bg-green-50 text-green-700" : p.status === "pending" ? "bg-amber-50 text-amber-700" : p.status === "hidden" ? "bg-gray-100 text-gray-700" : "bg-red-50 text-red-700")}>{p.status}</span></td>
                <td className="p-3"><div className="flex gap-1">{p.premium && <Crown className="h-3.5 w-3.5 text-secondary-500" />}{p.verified && <BadgeCheck className="h-3.5 w-3.5 text-green-600" />}{p.featured && <Star className="h-3.5 w-3.5 text-amber-500" />}</div></td>
                <td className="p-3 text-xs">{p.createdBy}</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">
                  {p.status !== "approved" && <button type="button" title="Approve" onClick={() => act(p, { status: "approved" })} className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"><Check className="h-4 w-4" /></button>}
                  {p.status !== "rejected" && <button type="button" title="Reject" onClick={() => act(p, { status: "rejected" })} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button>}
                  {p.status === "hidden" ? <button type="button" title="Show" onClick={() => act(p, { status: "approved" })} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></button> : <button type="button" title="Hide" onClick={() => act(p, { status: "hidden" })} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-50"><EyeOff className="h-4 w-4" /></button>}
                  <button type="button" title="Mark Premium" onClick={() => act(p, { premium: !p.premium })} className={cn("rounded-lg p-1.5", p.premium ? "text-secondary-600" : "text-muted hover:bg-secondary-50 hover:text-secondary-600")}><Crown className="h-4 w-4" /></button>
                  <button type="button" title="Verify" onClick={() => act(p, { verified: !p.verified })} className={cn("rounded-lg p-1.5", p.verified ? "text-green-600" : "text-muted hover:bg-green-50 hover:text-green-600")}><BadgeCheck className="h-4 w-4" /></button>
                  <button type="button" title="Feature" onClick={() => act(p, { featured: !p.featured })} className={cn("rounded-lg p-1.5", p.featured ? "text-amber-500" : "text-muted hover:bg-amber-50 hover:text-amber-500")}><Star className="h-4 w-4" /></button>
                  <button type="button" title="Delete" onClick={() => { if (confirm("Delete this profile?")) deleteProfile(p.id, admin).then(load); }} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
