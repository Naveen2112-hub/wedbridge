import { collection, doc, getDoc, getDocs, query, where, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";

export type ReportReason =
  | "fake_profile"
  | "inappropriate_photo"
  | "harassment"
  | "spam"
  | "misleading_info"
  | "other";

export interface ReportRecord {
  id: string;
  reporterUid: string;
  reportedUid: string;
  reason: ReportReason;
  description: string;
  status: "pending" | "reviewed" | "actioned" | "dismissed";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export async function reportUser(
  reporterUid: string,
  reportedUid: string,
  reason: ReportReason,
  description: string,
): Promise<string | null> {
  if (!db || reporterUid === reportedUid) return null;
  try {
    const ref = doc(collection(db, collections.reports));
    await setDoc(ref, {
      reporterUid,
      reportedUid,
      reason,
      description: description.slice(0, 1000),
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch {
    return null;
  }
}

export async function getReportsByStatus(status: ReportRecord["status"]): Promise<ReportRecord[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(collection(db, collections.reports), where("status", "==", status)),
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportRecord, "id">) }));
  } catch {
    return [];
  }
}

export async function updateReportStatus(
  reportId: string,
  status: ReportRecord["status"],
  adminUid: string,
): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, collections.reports, reportId), {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });
    return true;
  } catch {
    return false;
  }
}
