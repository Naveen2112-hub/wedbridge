import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type AppUser, type ProfileDocument, type VendorDocument } from "@/firebase/schema";
import { logger } from "@/lib/monitoring/logger";

export type ExportFormat = "csv" | "excel" | "pdf";

function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCSV(headers: string[], rows: (string | number | undefined | null)[][]): string {
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines = rows.map((row) => row.map(escapeCSV).join(","));
  return [headerLine, ...dataLines].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadHTMLAsPDF(htmlContent: string, filename: string) {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(htmlContent);
  win.document.close();
  setTimeout(() => {
    win.print();
  }, 500);
}

export async function exportUsers(format: ExportFormat, max = 1000): Promise<void> {
  if (!db) return;
  try {
    const snap = await getDocs(query(collection(db, collections.users), limit(max)));
    const users = snap.docs.map((d) => d.data() as AppUser);
    const profiles = await getDocs(query(collection(db, collections.profiles), limit(max)));
    const profileMap = new Map<string, ProfileDocument>();
    profiles.docs.forEach((d) => {
      const p = d.data() as ProfileDocument;
      if (p.uid) profileMap.set(p.uid, p);
    });

    const headers = ["UID", "Name", "Email", "Phone", "Role", "Gender", "Membership", "Verified", "Status", "Religion", "Caste", "City", "Created At"];
    const rows = users.map((u) => {
      const p = profileMap.get(u.uid);
      const ts = (u.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.();
      return [
        u.uid,
        u.name ?? u.displayName ?? "",
        u.email ?? "",
        u.phone ?? "",
        u.role,
        u.gender ?? "",
        u.membershipTier ?? "free",
        u.verified ? "Yes" : "No",
        u.status,
        p?.religion ?? "",
        p?.caste ?? "",
        p?.city ?? "",
        ts ? new Date(ts).toLocaleDateString("en-IN") : "",
      ];
    });

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      downloadFile(toCSV(headers, rows), `users-${timestamp}.csv`, "text/csv");
    } else if (format === "excel") {
      const html = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      downloadFile(html, `users-${timestamp}.xls`, "application/vnd.ms-excel");
    } else if (format === "pdf") {
      const html = `<!DOCTYPE html><html><head><title>Users Export</title><style>body{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5}</style></head><body><h1>WedBridge Users Export - ${timestamp}</h1><p>Total: ${users.length} users</p><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
      downloadHTMLAsPDF(html, `users-${timestamp}.pdf`);
    }
    logger.info("Users exported", { format, count: users.length });
  } catch (e) {
    logger.error("User export failed", { error: e instanceof Error ? e.message : String(e) });
  }
}

export async function exportVendors(format: ExportFormat, max = 1000): Promise<void> {
  if (!db) return;
  try {
    const snap = await getDocs(query(collection(db, collections.vendors), limit(max)));
    const vendors = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorDocument, "id">) }));

    const headers = ["ID", "Business Name", "Category", "City", "District", "State", "Phone", "Email", "Starting Price", "Rating", "Review Count", "Status", "Featured", "Created At"];
    const rows = vendors.map((v) => {
      const ts = (v.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.();
      return [
        v.id,
        v.businessName,
        v.category,
        v.city,
        v.district,
        v.state,
        v.phone,
        v.email,
        v.startingPrice,
        v.rating,
        v.reviewCount,
        v.status,
        v.featured ? "Yes" : "No",
        ts ? new Date(ts).toLocaleDateString("en-IN") : "",
      ];
    });

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      downloadFile(toCSV(headers, rows), `vendors-${timestamp}.csv`, "text/csv");
    } else if (format === "excel") {
      const html = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      downloadFile(html, `vendors-${timestamp}.xls`, "application/vnd.ms-excel");
    } else if (format === "pdf") {
      const html = `<!DOCTYPE html><html><head><title>Vendors Export</title><style>body{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5}</style></head><body><h1>WedBridge Vendors Export - ${timestamp}</h1><p>Total: ${vendors.length} vendors</p><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
      downloadHTMLAsPDF(html, `vendors-${timestamp}.pdf`);
    }
    logger.info("Vendors exported", { format, count: vendors.length });
  } catch (e) {
    logger.error("Vendor export failed", { error: e instanceof Error ? e.message : String(e) });
  }
}
