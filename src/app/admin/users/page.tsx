"use client";
import { useEffect, useState } from "react";
import { Search, Ban, CircleCheck as CheckCircle2, Trash2, KeyRound, BadgeCheck, Eye, X } from "lucide-react";
import { listUsers, updateUser, deleteUser } from "@/lib/admin/adminService";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import type { AdminUser } from "@/lib/admin/schema";
import { cn } from "@/lib/cn";

export default function AdminUsersPage() {
  const { adminUser } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "blocked" | "verified" | "unverified">("all");
  const [view, setView] = useState<AdminUser | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => { setUsers(await listUsers(500)); setLoading(false); };
  const admin = adminUser ? { uid: adminUser.uid, email: adminUser.email } : undefined;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const match = !q || u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q);
    const f = filter === "all" ? true : filter === "active" ? u.status === "active" : filter === "blocked" ? u.status === "blocked" : filter === "verified" ? u.verified : !u.verified;
    return match && f;
  });

  const act = async (u: AdminUser, data: Partial<AdminUser>, reload = true) => { await updateUser(u.uid, data, admin); if (reload) load(); };

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Users</h1><p className="text-lead mt-1 text-sm">Manage platform users, verify and block accounts.</p></div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input className="input pl-10" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="input max-w-[180px]" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All Users</option><option value="active">Active</option><option value="blocked">Blocked</option><option value="verified">Verified</option><option value="unverified">Unverified</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-primary-100 text-left text-muted"><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Membership</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-muted">No users found.</td></tr> :
            filtered.map((u) => (
              <tr key={u.uid} className="border-b border-primary-100 last:border-0">
                <td className="p-3"><button type="button" onClick={() => setView(u)} className="flex items-center gap-2 text-left"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">{(u.displayName ?? u.email ?? "U").charAt(0).toUpperCase()}</span><div><p className="font-medium text-primary-900">{u.displayName ?? "Unnamed"}</p><p className="text-xs text-muted">{u.email}</p></div></button></td>
                <td className="p-3"><span className={cn("badge", u.role === "admin" ? "bg-primary-50 text-primary-700" : "bg-primary-50/50 text-muted")}>{u.role}</span></td>
                <td className="p-3 text-xs capitalize">{u.membershipTier ?? "free"}</td>
                <td className="p-3"><span className={cn("badge", u.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{u.status}</span></td>
                <td className="p-3"><div className="flex flex-wrap gap-1">
                  <button type="button" title="View" onClick={() => setView(u)} className="rounded-lg p-1.5 text-muted hover:bg-primary-50 hover:text-primary-700"><Eye className="h-4 w-4" /></button>
                  {u.status === "active" ? <button type="button" title="Block" onClick={() => act(u, { status: "blocked" })} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50"><Ban className="h-4 w-4" /></button> : <button type="button" title="Activate" onClick={() => act(u, { status: "active" })} className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"><CheckCircle2 className="h-4 w-4" /></button>}
                  <button type="button" title="Verify" onClick={() => act(u, { verified: true })} className="rounded-lg p-1.5 text-secondary-600 hover:bg-secondary-50"><BadgeCheck className="h-4 w-4" /></button>
                  <button type="button" title="Reset Password" onClick={() => act(u, { passwordResetRequested: true } as never, false)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><KeyRound className="h-4 w-4" /></button>
                  <button type="button" title="Delete" onClick={() => { if (confirm("Delete this user?")) deleteUser(u.uid, admin).then(load); }} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setView(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold text-primary-900">User Details</h3><button type="button" onClick={() => setView(null)}><X className="h-5 w-5 text-muted" /></button></div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Name" value={view.displayName ?? "—"} />
              <Row label="Email" value={view.email} />
              <Row label="Role" value={view.role} />
              <Row label="Membership" value={view.membershipTier ?? "free"} />
              <Row label="Status" value={view.status} />
              <Row label="Verified" value={view.verified ? "Yes" : "No"} />
              <Row label="Gender" value={view.gender ?? "—"} />
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-primary-50 py-1.5"><dt className="text-muted">{label}</dt><dd className="font-medium text-primary-900">{value}</dd></div>;
}
