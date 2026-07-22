"use client";
import { useState, useEffect, useCallback } from "react";
import { Send, Image as ImageIcon, FileText, Loader as Loader2, Check, X, Users, Crown, BadgeCheck, CircleUser as UserCircle, RefreshCw, Send as SendIcon, Download, Search, Filter, FileCheck, FileX, Copy, TriangleAlert as AlertTriangle } from "lucide-react";
import { useAdminAuth } from "@/lib/admin/AdminAuthContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

type TargetType = "all" | "premium" | "verified" | "specific";
type ImportStatus = "pending_review" | "approved" | "rejected" | "duplicate" | "failed_ocr";
type TabType = "imports" | "broadcast";

interface BroadcastResult { total: number; success: number; failed: number; failedUserIds: string[] }

interface ImportRecord {
  id: string;
  telegramChatId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedData: Record<string, string>;
  ocrConfidence: number;
  status: ImportStatus;
  importTime?: { seconds?: number } | string | null;
  duplicateOf?: string;
  reviewedBy?: string;
}

const STATUS_LABELS: Record<ImportStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  duplicate: "Duplicate",
  failed_ocr: "Failed OCR",
};

const STATUS_COLORS: Record<ImportStatus, string> = {
  pending_review: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-success-100 text-success-800 border-success-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  duplicate: "bg-orange-100 text-orange-800 border-orange-200",
  failed_ocr: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function AdminTelegramPage() {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabType>("imports");

  // ===== Imports state =====
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loadingImports, setLoadingImports] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ImportStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImport, setSelectedImport] = useState<ImportRecord | null>(null);
  const [reviewing, setReviewing] = useState(false);

  // ===== Broadcast state =====
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"none" | "photo" | "document">("none");
  const [target, setTarget] = useState<TargetType>("all");
  const [specificIds, setSpecificIds] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadImports = useCallback(async () => {
    setLoadingImports(true);
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/telegram/imports${params}`);
      if (res.ok) {
        const data = await res.json();
        setImports(data.imports ?? []);
      }
    } catch { /* ignore */ } finally { setLoadingImports(false); }
  }, [statusFilter]);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/telegram/broadcasts");
      if (res.ok) { const data = await res.json(); setHistory(data.broadcasts ?? []); }
    } catch { /* ignore */ } finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => { if (tab === "imports") loadImports(); }, [tab, loadImports]);
  useEffect(() => { if (tab === "broadcast") loadHistory(); }, [tab, loadHistory]);

  const handleApprove = async (importId: string) => {
    setReviewing(true);
    try {
      const res = await fetch("/api/telegram/imports/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId, action: "approve", reviewedBy: adminUser?.uid ?? "admin" }),
      });
      if (res.ok) { toast("Import approved", "success"); loadImports(); setSelectedImport(null); }
      else toast("Failed to approve", "error");
    } catch { toast("Network error", "error"); }
    finally { setReviewing(false); }
  };

  const handleReject = async (importId: string) => {
    setReviewing(true);
    try {
      const res = await fetch("/api/telegram/imports/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId, action: "reject", reviewedBy: adminUser?.uid ?? "admin" }),
      });
      if (res.ok) { toast("Import rejected", "success"); loadImports(); setSelectedImport(null); }
      else toast("Failed to reject", "error");
    } catch { toast("Network error", "error"); }
    finally { setReviewing(false); }
  };

  const handleBroadcast = async () => {
    if (!message && !mediaUrl) { toast("Message or media URL is required", "error"); return; }
    if (target === "specific" && !specificIds.trim()) { toast("Enter at least one user ID", "error"); return; }
    setSending(true); setResult(null);
    try {
      const userIds = target === "specific" ? specificIds.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
      const res = await fetch("/api/telegram/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": adminUser?.uid ?? "" },
        body: JSON.stringify({ message, target: { type: target, userIds }, mediaType: mediaType === "none" ? undefined : mediaType, mediaUrl: mediaType !== "none" ? mediaUrl : undefined }),
      });
      const data: BroadcastResult = await res.json();
      if (res.ok) { setResult(data); toast(`Broadcast: ${data.success} sent, ${data.failed} failed`, "success"); setMessage(""); setMediaUrl(""); setMediaType("none"); loadHistory(); }
      else toast("Broadcast failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setSending(false); }
  };

  const handleRetry = async () => {
    if (!result || result.failedUserIds.length === 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/telegram/broadcast", {
        method: "POST", headers: { "Content-Type": "application/json", "x-user-id": adminUser?.uid ?? "" },
        body: JSON.stringify({ message, target: { type: "specific", userIds: result.failedUserIds } }),
      });
      const data: BroadcastResult = await res.json();
      if (res.ok) { setResult(data); toast(`Retry: ${data.success} sent, ${data.failed} failed`, "success"); }
    } catch { toast("Retry failed", "error"); }
    finally { setSending(false); }
  };

  const filteredImports = imports.filter((imp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return imp.fileName.toLowerCase().includes(q) ||
      imp.telegramChatId.includes(q) ||
      Object.values(imp.extractedData).some((v) => v.toLowerCase().includes(q));
  });

  const targets = [
    { value: "all" as TargetType, label: "All Users", icon: Users },
    { value: "premium" as TargetType, label: "Premium", icon: Crown },
    { value: "verified" as TargetType, label: "Verified", icon: BadgeCheck },
    { value: "specific" as TargetType, label: "Specific", icon: UserCircle },
  ];

  const statusOptions: { value: ImportStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending_review", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "duplicate", label: "Duplicates" },
    { value: "failed_ocr", label: "Failed OCR" },
  ];

  const formatTime = (t: ImportRecord["importTime"]): string => {
    if (!t) return "—";
    if (typeof t === "string") return t;
    if (t.seconds) return new Date(t.seconds * 1000).toLocaleString();
    return "—";
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><SendIcon className="h-6 w-6" /></span>
        <div><h1 className="heading-md">Telegram Management</h1><p className="text-lead text-sm">Manage biodata imports and broadcasts.</p></div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-primary-100">
        <button type="button" onClick={() => setTab("imports")} className={cn("flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition", tab === "imports" ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-primary-600")}>
          <FileText className="h-4 w-4" />Biodata Imports
        </button>
        <button type="button" onClick={() => setTab("broadcast")} className={cn("flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition", tab === "broadcast" ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-primary-600")}>
          <Send className="h-4 w-4" />Broadcast
        </button>
      </div>

      {/* ===== Imports Tab ===== */}
      {tab === "imports" && (
        <div className="mt-6 space-y-4">
          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10" placeholder="Search by name, phone, file..." />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ImportStatus | "all")} className="input py-2">
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button type="button" onClick={loadImports} className="btn-outline px-3 py-2"><RefreshCw className={cn("h-4 w-4", loadingImports && "animate-spin")} /></button>
            </div>
          </div>

          {/* Import list */}
          {loadingImports ? (
            <div className="card flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
          ) : filteredImports.length === 0 ? (
            <div className="card p-12 text-center"><p className="text-sm text-gray-500">No biodata imports found.</p></div>
          ) : (
            <div className="space-y-3">
              {filteredImports.map((imp) => (
                <div key={imp.id} className="card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {imp.fileType.includes("pdf") ? <FileText className="h-5 w-5 flex-none text-red-500" /> : <ImageIcon className="h-5 w-5 flex-none text-blue-500" />}
                        <span className="truncate font-medium text-gray-800">{imp.extractedData.name || imp.fileName}</span>
                        <span className={cn("flex-none rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_COLORS[imp.status])}>{STATUS_LABELS[imp.status]}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>Chat: {imp.telegramChatId}</span>
                        <span>Confidence: {Math.round(imp.ocrConfidence * 100)}%</span>
                        <span>{formatTime(imp.importTime)}</span>
                        {imp.duplicateOf && <span className="text-orange-600">Dup of: {imp.duplicateOf.slice(0, 8)}...</span>}
                      </div>
                      {imp.extractedData.phone && <span className="mt-1 inline-block text-xs text-gray-400">Phone: {imp.extractedData.phone}</span>}
                    </div>
                    <div className="flex flex-none gap-2">
                      <button type="button" onClick={() => setSelectedImport(imp)} className="rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50">View</button>
                      {imp.status === "pending_review" && (
                        <>
                          <button type="button" onClick={() => handleApprove(imp.id)} disabled={reviewing} className="flex items-center gap-1 rounded-lg bg-success-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-success-700"><Check className="h-3 w-3" />Approve</button>
                          <button type="button" onClick={() => handleReject(imp.id)} disabled={reviewing} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"><X className="h-3 w-3" />Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Broadcast Tab ===== */}
      {tab === "broadcast" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <h2 className="heading-sm">Compose Message</h2>
            <div className="mt-4">
              <label className="label">Send To</label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {targets.map((t) => (
                  <button key={t.value} type="button" onClick={() => setTarget(t.value)} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition", target === t.value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-primary-200 text-gray-700 hover:bg-primary-50")}>
                    <t.icon className="h-4 w-4" />{t.label}
                  </button>
                ))}
              </div>
              {target === "specific" && <input type="text" value={specificIds} onChange={(e) => setSpecificIds(e.target.value)} className="input mt-2" placeholder="Comma-separated user IDs" />}
            </div>
            <div className="mt-4"><label className="label" htmlFor="broadcast-msg">Message</label><textarea id="broadcast-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input resize-none" placeholder="Type your broadcast message..." /></div>
            <div className="mt-4">
              <label className="label">Media (optional)</label>
              <div className="mt-2 flex gap-2">
                {[{ value: "none" as const, label: "None", icon: X }, { value: "photo" as const, label: "Photo", icon: ImageIcon }, { value: "document" as const, label: "PDF", icon: FileText }].map((m) => (
                  <button key={m.value} type="button" onClick={() => setMediaType(m.value)} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition", mediaType === m.value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-primary-200 text-gray-700 hover:bg-primary-50")}>
                    <m.icon className="h-4 w-4" />{m.label}
                  </button>
                ))}
              </div>
              {mediaType !== "none" && <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="input mt-2" placeholder="https://example.com/file.jpg" />}
            </div>
            <button type="button" onClick={handleBroadcast} disabled={sending} className="btn-primary mt-4 w-full">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{sending ? "Sending..." : "Send Broadcast"}
            </button>
          </div>
          <div className="space-y-6">
            {result && !sending && (
              <div className="card p-6">
                <h2 className="heading-sm">Result</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3"><span className="text-sm text-gray-700">Total</span><span className="text-lg font-bold text-primary-800">{result.total}</span></div>
                  <div className="flex items-center justify-between rounded-xl bg-success-50 px-4 py-3"><span className="flex items-center gap-2 text-sm text-success-700"><Check className="h-4 w-4" />Success</span><span className="text-lg font-bold text-success-700">{result.success}</span></div>
                  {result.failed > 0 && <><div className="flex items-center justify-between rounded-xl bg-error-50 px-4 py-3"><span className="flex items-center gap-2 text-sm text-error-700"><X className="h-4 w-4" />Failed</span><span className="text-lg font-bold text-error-700">{result.failed}</span></div><button type="button" onClick={handleRetry} className="btn-outline w-full"><RefreshCw className="h-4 w-4" />Retry Failed</button></>}
                </div>
              </div>
            )}
            <div className="card p-6">
              <div className="flex items-center justify-between"><h2 className="heading-sm">Recent Broadcasts</h2><button type="button" onClick={loadHistory} className="text-gray-500 hover:text-primary-600"><RefreshCw className={cn("h-4 w-4", loadingHistory && "animate-spin")} /></button></div>
              {loadingHistory ? <div className="mt-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div> : history.length === 0 ? <p className="mt-4 text-sm text-gray-500">No broadcasts yet.</p> : (
                <div className="mt-4 space-y-2">{history.map((h, i) => { const item = h as { text?: string; target?: string; success?: number; failed?: number }; return <div key={i} className="rounded-xl border border-primary-100 px-3 py-2.5 text-sm"><p className="line-clamp-2 font-medium text-gray-800">{item.text ?? "No message"}</p><div className="mt-1 flex gap-3 text-xs text-gray-500"><span>Target: {item.target ?? "all"}</span><span>OK: {item.success ?? 0}</span><span>Failed: {item.failed ?? 0}</span></div></div>; })}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Import Detail Modal ===== */}
      {selectedImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedImport(null)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="heading-sm">Import Details</h2>
              <button type="button" onClick={() => setSelectedImport(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_COLORS[selectedImport.status])}>{STATUS_LABELS[selectedImport.status]}</span>
                <span className="text-xs text-gray-500">Confidence: {Math.round(selectedImport.ocrConfidence * 100)}%</span>
              </div>
              <div className="rounded-xl bg-primary-50 p-3 text-sm">
                <p className="font-medium text-gray-700">File: {selectedImport.fileName}</p>
                <p className="text-xs text-gray-500">Type: {selectedImport.fileType} | Size: {(selectedImport.fileSize / 1024).toFixed(1)} KB</p>
                <p className="text-xs text-gray-500">Chat ID: {selectedImport.telegramChatId}</p>
              </div>
              {selectedImport.ocrConfidence < 0.8 && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle className="h-4 w-4 flex-none" />Some fields may need manual review due to low OCR confidence.</div>
              )}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Extracted Fields</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedImport.extractedData).length === 0 ? <p className="text-sm text-gray-400">No fields extracted.</p> : Object.entries(selectedImport.extractedData).map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-primary-100 px-3 py-2">
                      <p className="text-xs font-medium text-gray-500">{key}</p>
                      <p className="text-sm text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedImport.extractedData, null, 2))} className="btn-outline flex items-center gap-1.5"><Copy className="h-4 w-4" />Copy JSON</button>
                <button type="button" onClick={() => handleApprove(selectedImport.id)} disabled={reviewing || selectedImport.status !== "pending_review"} className="btn-primary flex items-center gap-1.5"><FileCheck className="h-4 w-4" />Approve</button>
                <button type="button" onClick={() => handleReject(selectedImport.id)} disabled={reviewing || selectedImport.status !== "pending_review"} className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"><FileX className="h-4 w-4" />Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
