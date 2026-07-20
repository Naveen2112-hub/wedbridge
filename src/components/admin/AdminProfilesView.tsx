"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Trash2, BadgeCheck, Star, Loader as Loader2 } from "lucide-react";
import { listProfiles, deleteProfile, updateProfile } from "@/lib/admin/adminService";
import type { ProfileDocument } from "@/firebase/schema";
import { formatDate, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function AdminProfilesView() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => { setLoading(true); const p = await listProfiles(200); setProfiles(p); setLoading(false); };
  useEffect(() => { load(); }, []);

  const filtered = profiles.filter((p) => { const q = search.toLowerCase(); return !q || p.name?.toLowerCase().includes(q) || p.religion?.toLowerCase().includes(q); });

  const handleDelete = async (id: string) => { if (!confirm("Delete this profile?")) return; setActing(id); await deleteProfile(id); setActing(null); toast("Profile deleted", "success"); load(); };
  const toggleVerified = async (p: ProfileDocument) => { setActing(p.id ?? null); await updateProfile(p.id ?? "", { verified: !p.verified }); setActing(null); toast("Updated", "success"); load(); };
  const toggleFeatured = async (p: ProfileDocument) => { setActing(p.id ?? null); await updateProfile(p.id ?? "", { featured: !p.featured }); setActing(null); toast("Updated", "success"); load(); };

  return (
    <div>
      <div className="mb-6"><h1 className="heading-md">Profiles</h1><p className="text-lead mt-1 text-sm">Manage all user profiles</p></div>
      <div className="mb-4 relative max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input className="input pl-10" placeholder="Search profiles…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {loading ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40 w-full rounded-xl" />)}</div> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-center gap-3"><div className="h-12 w-12 overflow-hidden rounded-xl bg-primary-100">{p.photoURL && <Image src={p.photoURL} alt={p.name} fill className="h-full w-full object-cover" />}</div><div className="flex-1"><h3 className="font-semibold text-primary-900">{p.name}</h3><p className="text-xs text-muted">{p.religion} · {p.caste ?? ""}</p><p className="text-xs text-muted">{formatDate(p.createdAt as unknown as string)}</p></div></div>
              <div className="mt-3 flex items-center gap-2">{acting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><button type="button" onClick={() => toggleVerified(p)} className={cn("badge", p.verified ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600")}><BadgeCheck className="h-3 w-3" />{p.verified ? "Verified" : "Verify"}</button><button type="button" onClick={() => toggleFeatured(p)} className={cn("badge", p.featured ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-600")}><Star className="h-3 w-3" />{p.featured ? "Featured" : "Feature"}</button><button type="button" onClick={() => handleDelete(p.id ?? "")} className="ml-auto rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
