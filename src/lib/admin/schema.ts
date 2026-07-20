import { collection, doc, addDoc, query, where, getDocs, getDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";

export const collections = {
  users: "users",
  profiles: "profiles",
  vendors: "vendors",
  payments: "payments",
  subscriptions: "subscriptions",
  interests: "interests",
  notifications: "notifications",
  auditLog: "auditLog",
  settings: "settings",
} as const;

export type UserRole = "user" | "admin" | "vendor";

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: "active" | "blocked";
  verified: boolean;
  gender?: "male" | "female" | "other";
  membershipTier?: "free" | "premium" | "gold";
  createdAt: unknown;
}

export interface AdminProfile {
  id: string;
  userId: string;
  name: string;
  gender: "male" | "female";
  religion?: string;
  caste?: string;
  education?: string;
  occupation?: string;
  phone?: string;
  district?: string;
  dob?: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  premium: boolean;
  verified: boolean;
  featured: boolean;
  createdBy: "user" | "admin" | "ocr" | "bulk";
  createdAt: unknown;
}

export interface AdminPayment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  plan: string;
  status: "pending" | "verified" | "refunded" | "failed";
  createdAt: unknown;
}

export interface AuditLogEntry {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  target: string;
  details?: string;
  createdAt: unknown;
}

export interface SiteSettings {
  websiteName: string;
  logoURL: string;
  bannerURL: string;
  supportPhone: string;
  supportEmail: string;
  socialLinks: { facebook?: string; instagram?: string; twitter?: string; youtube?: string };
  membershipPricing: { premium: number; gold: number };
  homepageBanners: string[];
}

export const defaultSettings: SiteSettings = {
  websiteName: "WedBridge",
  logoURL: "",
  bannerURL: "",
  supportPhone: "",
  supportEmail: "",
  socialLinks: {},
  membershipPricing: { premium: 999, gold: 1999 },
  homepageBanners: [],
};

export async function logAdminAction(entry: Omit<AuditLogEntry, "id" | "createdAt">): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.auditLog), { ...entry, createdAt: serverTimestamp() } as Omit<AuditLogEntry, "id">); } catch { /* ignore */ }
}

export async function getAuditLogs(max = 100): Promise<AuditLogEntry[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.auditLog), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLogEntry, "id">) }));
  } catch { return []; }
}
