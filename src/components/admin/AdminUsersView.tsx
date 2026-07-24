"use client";
import { useEffect, useState } from "react";
import { Search, Trash2, Crown, BadgeCheck, Loader as Loader2 } from "lucide-react";
import { listUsers, deleteUser, updateUser } from "@/lib/admin/adminService";
import type { AppUser } from "@/firebase/schema";
import { formatDate, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function AdminUsersView() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => { setLoading(true); try { const u = await listUsers(200); setUsers(u); } catch (err) { console.error("Failed to load users:", err); toast("Failed to load users", "error"); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => { const q = search.toLowerCase(); return !q || u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q); });

  const handleDelete = async (uid: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setActing(uid); try { await deleteUser(uid); toast("User deleted", "success"); load(); } catch (err) { console.error(err); toast("Failed to delete user", "error"); } finally { setActing(null); }
  };
  const togglePremium = async (u: AppUser) => {
    setActing(u.uid); try { await updateUser(u.uid, { membershipTier: u.membershipTier === "free" ? "premium" : "free" }); toast("User updated", "success"); load(); } catch (err) { console.error(err); toast("Failed to update user", "error"); } finally { setActing(null); }
  };
  const toggleVerified = async (u: AppUser) => {
    setActing(u.uid); try { await updateUser(u.uid, { verified: !u.verified }); toast("User updated", "success"); load(); } catch (err) { console.error(err); toast("Failed to update user", "error"); } finally { setActing(null); }
  };

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Users</h1><p className="text-lead mt-1 text-sm">Manage all platform users</p></div>
      <div className="mb-4 relative max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input className="input pl-10" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}</div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-primary-100 text-left text-xs text-gray-500"><th className="p-3">User</th><th className="p-3">Email</th><th className="p-3">Tier</th><th className="p-3">Status</th><th className="p-3">Joined</th><th className="p-3">Actions</th></tr></thead>
            <tbody>{filtered.map((u) => (
              <tr key={u.uid} className="border-b border-primary-50 hover:bg-primary-25">
                <td className="p-3 font-medium text-primary-900">{u.displayName ?? "—"}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3"><span className={cn("badge", u.membershipTier === "gold" ? "bg-amber-50 text-amber-700" : u.membershipTier === "premium" ? "bg-secondary-50 text-secondary-700" : "bg-primary-50 text-primary-700")}>{u.membershipTier ?? "free"}</span></td>
                <td className="p-3">{u.verified ? <span className="badge bg-green-50 text-green-700">Verified</span> : <span className="badge bg-gray-50 text-gray-600">Unverified</span>}</td>
                <td className="p-3 text-gray-500">{formatDate(u.createdAt as unknown as string)}</td>
                <td className="p-3"><div className="flex gap-2">{acting === u.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <><button type="button" onClick={() => togglePremium(u)} title="Toggle premium" className="rounded-lg p-1.5 text-secondary-600 hover:bg-secondary-50"><Crown className="h-4 w-4" /></button><button type="button" onClick={() => toggleVerified(u)} title="Toggle verified" className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"><BadgeCheck className="h-4 w-4" /></button><button type="button" onClick={() => handleDelete(u.uid)} title="Delete" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></>}</div></td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
