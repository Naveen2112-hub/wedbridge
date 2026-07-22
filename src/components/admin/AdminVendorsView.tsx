"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Search, Plus, CreditCard as Edit, Trash2, Check, X, Star, RefreshCw, CircleCheck as CheckCircle, Circle as XCircle, Clock, Award, Layers, Loader as Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
  getAllVendors, getVendorAnalytics, filterVendors, searchVendors,
  approveVendor, rejectVendor, deleteVendor, toggleFeatured, toggleActive,
  createVendor, updateVendorAdmin, bulkApprove, bulkReject, bulkDelete, bulkSetFeatured, bulkSetActive,
  type VendorFilter, type VendorFormData, type VendorAnalytics,
} from "@/lib/admin/vendorAdminService";
import { getCategoryName, type VendorDocument } from "@/firebase/schema";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { useToast } from "@/components/ui/Toast";
import { logAdminActivity } from "@/lib/admin/activityLogService";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";
import { VendorForm } from "./VendorForm";
import { ConfirmDialog } from "./ConfirmDialog";

type ViewMode = "list" | "form";

export function AdminVendorsView() {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("list");
  const [editingVendor, setEditingVendor] = useState<VendorDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<VendorFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<VendorAnalytics>({ total: 0, active: 0, pending: 0, featured: 0, categories: 0 });
  const [deleteTarget, setDeleteTarget] = useState<VendorDocument | null>(null);
  const [rejectTarget, setRejectTarget] = useState<VendorDocument | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const v = await getAllVendors(500);
    setVendors(v);
    setAnalytics(await getVendorAnalytics(v));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = filterVendors(vendors, activeFilter);
    result = searchVendors(result, searchQuery);
    return result;
  }, [vendors, activeFilter, searchQuery]);

  const filters: { id: VendorFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: vendors.length },
    { id: "pending", label: "Pending", count: vendors.filter((v) => v.status === "pending").length },
    { id: "approved", label: "Approved", count: vendors.filter((v) => v.status === "approved").length },
    { id: "rejected", label: "Rejected", count: vendors.filter((v) => v.status === "rejected").length },
    { id: "featured", label: "Featured", count: vendors.filter((v) => v.featured).length },
    { id: "active", label: "Active", count: vendors.filter((v) => v.active !== false).length },
    { id: "inactive", label: "Inactive", count: vendors.filter((v) => v.active === false).length },
  ];

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((v) => v.id)));
  };

  const handleAdd = () => { setEditingVendor(null); setView("form"); };
  const handleEdit = (v: VendorDocument) => { setEditingVendor(v); setView("form"); };

  const handleFormSubmit = async (data: VendorFormData): Promise<boolean> => {
    if (!adminUser) return false;
    if (editingVendor) {
      const ok = await updateVendorAdmin(editingVendor.id, data, adminUser.uid);
      if (ok) await logAdminActivity(adminUser.uid, adminUser.email ?? "", "update", "vendor", `Updated vendor: ${data.businessName}`);
      setView("list"); setEditingVendor(null); load();
      return ok;
    } else {
      const id = await createVendor(data, adminUser.uid);
      if (id) await logAdminActivity(adminUser.uid, adminUser.email ?? "", "create", "vendor", `Created vendor: ${data.businessName}`);
      setView("list"); load();
      return !!id;
    }
  };

  const handleApprove = async (v: VendorDocument) => {
    if (!adminUser) return;
    setActing(v.id);
    const ok = await approveVendor(v.id, adminUser.uid);
    if (ok) { toast("Vendor approved", "success"); await logAdminActivity(adminUser.uid, adminUser.email ?? "", "approve", "vendor", `Approved: ${v.businessName}`); load(); }
    else toast("Failed to approve vendor", "error");
    setActing(null);
  };

  const handleReject = async () => {
    if (!adminUser || !rejectTarget) return;
    setActing(rejectTarget.id);
    const ok = await rejectVendor(rejectTarget.id, adminUser.uid, rejectReason);
    if (ok) { toast("Vendor rejected", "success"); await logAdminActivity(adminUser.uid, adminUser.email ?? "", "reject", "vendor", `Rejected: ${rejectTarget.businessName}`); load(); }
    else toast("Failed to reject vendor", "error");
    setActing(null); setRejectTarget(null); setRejectReason("");
  };

  const handleDelete = async () => {
    if (!adminUser || !deleteTarget) return;
    setActing(deleteTarget.id);
    const ok = await deleteVendor(deleteTarget.id);
    if (ok) { toast("Vendor deleted", "success"); await logAdminActivity(adminUser.uid, adminUser.email ?? "", "delete", "vendor", `Deleted: ${deleteTarget.businessName}`); load(); }
    else toast("Failed to delete vendor", "error");
    setActing(null); setDeleteTarget(null);
  };

  const handleToggleFeatured = async (v: VendorDocument) => {
    if (!adminUser) return;
    setActing(v.id);
    const ok = await toggleFeatured(v.id, !v.featured, adminUser.uid);
    if (ok) { toast(v.featured ? "Removed from featured" : "Marked as featured", "success"); load(); }
    else toast("Failed to update", "error");
    setActing(null);
  };

  const handleToggleActive = async (v: VendorDocument) => {
    if (!adminUser) return;
    setActing(v.id);
    const ok = await toggleActive(v.id, !(v.active ?? false), adminUser.uid);
    if (ok) { toast(v.active ? "Deactivated" : "Activated", "success"); load(); }
    else toast("Failed to update", "error");
    setActing(null);
  };

  const handleBulkApprove = async () => {
    if (!adminUser) return;
    setActing("bulk");
    await bulkApprove(Array.from(selected), adminUser.uid);
    toast(`${selected.size} vendors approved`, "success");
    await logAdminActivity(adminUser.uid, adminUser.email ?? "", "approve", "vendors", `Bulk approved ${selected.size} vendors`);
    setSelected(new Set()); setActing(null); load();
  };

  const handleBulkReject = async () => {
    if (!adminUser) return;
    setActing("bulk");
    await bulkReject(Array.from(selected), adminUser.uid, bulkRejectReason);
    toast(`${selected.size} vendors rejected`, "success");
    await logAdminActivity(adminUser.uid, adminUser.email ?? "", "reject", "vendors", `Bulk rejected ${selected.size} vendors`);
    setSelected(new Set()); setActing(null); setBulkRejectOpen(false); setBulkRejectReason(""); load();
  };

  const handleBulkDelete = async () => {
    setActing("bulk");
    await bulkDelete(Array.from(selected));
    toast(`${selected.size} vendors deleted`, "success");
    if (adminUser) await logAdminActivity(adminUser.uid, adminUser.email ?? "", "delete", "vendors", `Bulk deleted ${selected.size} vendors`);
    setSelected(new Set()); setActing(null); setBulkDeleteOpen(false); load();
  };

  const handleBulkFeatured = async () => {
    if (!adminUser) return;
    setActing("bulk");
    await bulkSetFeatured(Array.from(selected), true, adminUser.uid);
    toast(`${selected.size} vendors marked as featured`, "success");
    setSelected(new Set()); setActing(null); load();
  };

  const handleBulkActive = async () => {
    if (!adminUser) return;
    setActing("bulk");
    await bulkSetActive(Array.from(selected), true, adminUser.uid);
    toast(`${selected.size} vendors activated`, "success");
    setSelected(new Set()); setActing(null); load();
  };

  if (view === "form") {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="heading-md">{editingVendor ? "Edit Vendor" : "Add Vendor"}</h1><p className="text-lead mt-1 text-sm">{editingVendor ? `Editing ${editingVendor.businessName}` : "Create a new vendor profile"}</p></div>
          <button type="button" onClick={() => { setView("list"); setEditingVendor(null); }} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"><X className="h-4 w-4" />Back to List</button>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <VendorForm initial={editingVendor ?? undefined} onSubmit={handleFormSubmit} onCancel={() => { setView("list"); setEditingVendor(null); }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="heading-md flex items-center gap-2"><Store className="h-6 w-6 text-primary-700" />Vendors</h1><p className="text-lead mt-1 text-sm">Manage all wedding service vendors</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />Refresh</button>
          <button type="button" onClick={handleAdd} className="flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"><Plus className="h-4 w-4" />Add Vendor</button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AnalyticsCard icon={Store} label="Total Vendors" value={analytics.total} color="text-primary-600 bg-primary-50" />
        <AnalyticsCard icon={CheckCircle} label="Active" value={analytics.active} color="text-green-600 bg-green-50" />
        <AnalyticsCard icon={Clock} label="Pending" value={analytics.pending} color="text-amber-600 bg-amber-50" />
        <AnalyticsCard icon={Award} label="Featured" value={analytics.featured} color="text-secondary-600 bg-secondary-50" />
        <AnalyticsCard icon={Layers} label="Categories" value={analytics.categories} color="text-blue-600 bg-blue-50" />
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by business, category, city, owner, phone..." className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f.id} type="button" onClick={() => setActiveFilter(f.id)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", activeFilter === f.id ? "bg-primary-700 text-white" : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50")}>
            {f.label} <span className={cn("ml-1 text-xs", activeFilter === f.id ? "text-primary-200" : "text-gray-400")}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary-50 p-3">
              <span className="text-sm font-medium text-primary-900">{selected.size} selected</span>
              <button type="button" onClick={handleBulkApprove} disabled={acting === "bulk"} className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"><Check className="h-3 w-3" />Approve</button>
              <button type="button" onClick={() => setBulkRejectOpen(true)} disabled={acting === "bulk"} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"><X className="h-3 w-3" />Reject</button>
              <button type="button" onClick={handleBulkFeatured} disabled={acting === "bulk"} className="flex items-center gap-1 rounded-lg bg-secondary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-secondary-700"><Star className="h-3 w-3" />Feature</button>
              <button type="button" onClick={handleBulkActive} disabled={acting === "bulk"} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"><CheckCircle className="h-3 w-3" />Activate</button>
              <button type="button" onClick={() => setBulkDeleteOpen(true)} disabled={acting === "bulk"} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"><Trash2 className="h-3 w-3" />Delete</button>
              <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Clear selection</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor Table */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No vendors found. Try adjusting your filters or add a new vendor.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-primary-600" /></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Business</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Owner</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">City</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((v) => (
                  <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)} className="h-4 w-4 rounded border-gray-300 text-primary-600" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 flex-none overflow-hidden rounded-lg bg-primary-100">
                          {v.logoURL && <Image src={v.logoURL} alt={v.businessName} width={36} height={36} className="h-full w-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{v.businessName}</p>
                          {v.featured && <span className="flex items-center gap-0.5 text-xs text-secondary-600"><Star className="h-3 w-3" fill="currentColor" />Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{getCategoryName(v.category)}</td>
                    <td className="px-4 py-3 text-gray-600">{v.ownerName ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{v.city ?? "-"}, {v.state ?? ""}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(v.startingPrice)}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} active={v.active ?? false} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {v.status === "pending" && (
                          <button type="button" onClick={() => handleApprove(v)} disabled={acting === v.id} title="Approve" className="rounded-lg p-1.5 text-green-600 hover:bg-green-50">{acting === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}</button>
                        )}
                        {v.status !== "rejected" && (
                          <button type="button" onClick={() => { setRejectTarget(v); setRejectReason(""); }} disabled={acting === v.id} title="Reject" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button>
                        )}
                        <button type="button" onClick={() => handleToggleFeatured(v)} disabled={acting === v.id} title="Toggle Featured" className={cn("rounded-lg p-1.5 hover:bg-amber-50", v.featured ? "text-amber-500" : "text-gray-400")}><Star className="h-4 w-4" fill={v.featured ? "currentColor" : "none"} /></button>
                        <button type="button" onClick={() => handleToggleActive(v)} disabled={acting === v.id} title="Toggle Active" className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><CheckCircle className={cn("h-4 w-4", v.active === false && "text-gray-300")} /></button>
                        <button type="button" onClick={() => handleEdit(v)} title="Edit" className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setDeleteTarget(v)} title="Delete" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog open={!!deleteTarget} title="Delete Vendor" message={`Are you sure you want to delete "${deleteTarget?.businessName}"? This action cannot be undone.`} confirmLabel="Delete" destructive onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {/* Reject with Reason */}
      <ConfirmDialog open={!!rejectTarget} title="Reject Vendor" message={`Reject "${rejectTarget?.businessName}"? Please provide a reason.`} confirmLabel="Reject" destructive onConfirm={handleReject} onCancel={() => { setRejectTarget(null); setRejectReason(""); }}>
        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Rejection reason..." rows={3} className="mt-3 w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none" />
      </ConfirmDialog>

      {/* Bulk Reject */}
      <ConfirmDialog open={bulkRejectOpen} title="Bulk Reject Vendors" message={`Reject ${selected.size} vendors? Please provide a reason.`} confirmLabel="Reject All" destructive onConfirm={handleBulkReject} onCancel={() => { setBulkRejectOpen(false); setBulkRejectReason(""); }}>
        <textarea value={bulkRejectReason} onChange={(e) => setBulkRejectReason(e.target.value)} placeholder="Rejection reason..." rows={3} className="mt-3 w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none" />
      </ConfirmDialog>

      {/* Bulk Delete */}
      <ConfirmDialog open={bulkDeleteOpen} title="Bulk Delete Vendors" message={`Are you sure you want to delete ${selected.size} vendors? This action cannot be undone.`} confirmLabel="Delete All" destructive onConfirm={handleBulkDelete} onCancel={() => setBulkDeleteOpen(false)} />
    </div>
  );
}

function AnalyticsCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
      <div className="flex items-center gap-2"><span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color)}><Icon className="h-4 w-4" /></span><span className="text-xs font-medium text-gray-500">{label}</span></div>
      <p className="mt-2 font-display text-2xl font-bold text-primary-900">{value}</p>
    </motion.div>
  );
}

function StatusBadge({ status, active }: { status: string; active: boolean }) {
  const config: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "text-amber-700 bg-amber-50" },
    approved: { label: active ? "Active" : "Approved", color: "text-green-700 bg-green-50" },
    rejected: { label: "Rejected", color: "text-red-700 bg-red-50" },
    suspended: { label: "Suspended", color: "text-gray-700 bg-gray-100" },
  };
  const c = config[status] ?? config.pending;
  return <span className={cn("inline-block rounded-lg px-2 py-1 text-xs font-medium", c.color)}>{c.label}</span>;
}
