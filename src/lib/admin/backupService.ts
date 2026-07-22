import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";
import { logger } from "@/lib/monitoring/logger";
import { logAdminActivity } from "./activityLogService";

export interface BackupResult {
  success: boolean;
  collections: { name: string; count: number }[];
  totalDocuments: number;
  timestamp: string;
  error?: string;
}

export interface BackupProgress {
  collection: string;
  current: number;
  total: number;
  status: "reading" | "complete" | "error";
}

const BACKUP_COLLECTIONS = [
  collections.users, collections.profiles, collections.vendors, collections.vendorBookings,
  collections.vendorReviews, collections.payments, collections.subscriptions, collections.interests,
  collections.notifications, collections.auditLog, collections.favourites, collections.aiMatches,
  collections.profileViews, collections.recentlyViewed, collections.searchHistory, collections.ocrImports,
  collections.broadcasts, collections.vendorPackages, collections.vendorGallery, collections.vendorCategories,
] as const;

export async function createBackup(adminUid: string, adminEmail: string, onProgress?: (p: BackupProgress) => void): Promise<BackupResult> {
  if (!db) return { success: false, collections: [], totalDocuments: 0, timestamp: new Date().toISOString(), error: "Database not configured" };
  const results: { name: string; count: number }[] = [];
  let totalDocuments = 0;
  const timestamp = new Date().toISOString();
  for (const colName of BACKUP_COLLECTIONS) {
    try {
      onProgress?.({ collection: colName, current: 0, total: BACKUP_COLLECTIONS.length, status: "reading" });
      const snap = await getDocs(query(collection(db, colName), limit(10000)));
      results.push({ name: colName, count: snap.docs.length });
      totalDocuments += snap.docs.length;
      onProgress?.({ collection: colName, current: results.length, total: BACKUP_COLLECTIONS.length, status: "complete" });
    } catch (e) {
      logger.warn(`Backup: failed to read collection ${colName}`, { error: e instanceof Error ? e.message : String(e) });
      results.push({ name: colName, count: 0 });
      onProgress?.({ collection: colName, current: results.length, total: BACKUP_COLLECTIONS.length, status: "error" });
    }
  }
  await logAdminActivity(adminUid, adminEmail, "backup", "database", `Backed up ${totalDocuments} documents across ${results.length} collections`);
  logger.info("Backup completed", { totalDocuments, collections: results.length });
  return { success: true, collections: results, totalDocuments, timestamp };
}

export async function exportCollectionAsJSON(colName: string): Promise<string> {
  if (!db) return "[]";
  try {
    const snap = await getDocs(query(collection(db, colName), limit(10000)));
    return JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() })), null, 2);
  } catch (e) {
    logger.error(`Export failed for ${colName}`, { error: e instanceof Error ? e.message : String(e) });
    return "[]";
  }
}
