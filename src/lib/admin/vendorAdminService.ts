import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type VendorDocument, type VendorStatus, type VendorCategory, type VendorSocialLinks } from "@/firebase/schema";
import { logger } from "@/lib/monitoring/logger";

export type VendorFilter = "all" | "pending" | "approved" | "rejected" | "featured" | "active" | "inactive";

export interface VendorFormData {
  businessName: string;
  category: VendorCategory;
  about: string;
  services: string[];
  experienceYears: number;
  gstNumber: string;
  pan: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp: string;
  state: string;
  district: string;
  city: string;
  address: string;
  pincode: string;
  location: { lat: number; lng: number } | null;
  startingPrice: number;
  paymentMethods: string[];
  logoURL: string;
  coverURL: string;
  galleryImages: string[];
  socialLinks: VendorSocialLinks;
  status: VendorStatus;
  featured: boolean;
  active: boolean;
}

function toVendor(d: { id: string; data: () => Record<string, unknown> }): VendorDocument {
  return { id: d.id, ...(d.data() as Omit<VendorDocument, "id">) };
}

export async function getAllVendors(max = 500): Promise<VendorDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.vendors), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => toVendor(d as unknown as { id: string; data: () => Record<string, unknown> }));
  } catch (e) {
    logger.error("Failed to fetch vendors", { error: e instanceof Error ? e.message : String(e) });
    return [];
  }
}

export async function getVendorById(id: string): Promise<VendorDocument | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, collections.vendors, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<VendorDocument, "id">) };
  } catch {
    return null;
  }
}

export async function createVendor(data: VendorFormData, adminUid: string): Promise<string | null> {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, collections.vendors), {
      ownerUid: adminUid,
      ownerName: data.ownerName,
      businessName: data.businessName,
      category: data.category,
      logoURL: data.logoURL,
      coverURL: data.coverURL,
      about: data.about,
      services: data.services,
      city: data.city,
      district: data.district,
      state: data.state,
      address: data.address,
      pincode: data.pincode,
      location: data.location,
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsapp,
      gstNumber: data.gstNumber,
      pan: data.pan,
      startingPrice: data.startingPrice,
      experienceYears: data.experienceYears,
      paymentMethods: data.paymentMethods,
      socialLinks: data.socialLinks,
      galleryImages: data.galleryImages,
      rating: 0,
      reviewCount: 0,
      featured: data.featured,
      active: data.active,
      status: data.status,
      verificationStatus: "unverified",
      contactVisibility: "after_accept",
      createdBy: adminUid,
      updatedBy: adminUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as Omit<VendorDocument, "id">);
    logger.info("Vendor created", { id: ref.id, adminUid });
    return ref.id;
  } catch (e) {
    logger.error("Failed to create vendor", { error: e instanceof Error ? e.message : String(e) });
    return null;
  }
}

export async function updateVendorAdmin(id: string, data: Partial<VendorFormData>, adminUid: string): Promise<boolean> {
  if (!db) return false;
  try {
    const { ...updateData } = data;
    await updateDoc(doc(db, collections.vendors, id), {
      ...updateData,
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    });
    logger.info("Vendor updated", { id, adminUid });
    return true;
  } catch (e) {
    logger.error("Failed to update vendor", { error: e instanceof Error ? e.message : String(e) });
    return false;
  }
}

export async function deleteVendor(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, collections.vendors, id));
    logger.info("Vendor deleted", { id });
    return true;
  } catch (e) {
    logger.error("Failed to delete vendor", { error: e instanceof Error ? e.message : String(e) });
    return false;
  }
}

export async function approveVendor(id: string, adminUid: string): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, collections.vendors, id), {
      status: "approved" as VendorStatus,
      active: true,
      approvedBy: adminUid,
      approvedAt: serverTimestamp(),
      rejectionReason: "",
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    });
    logger.info("Vendor approved", { id, adminUid });
    return true;
  } catch (e) {
    logger.error("Failed to approve vendor", { error: e instanceof Error ? e.message : String(e) });
    return false;
  }
}

export async function rejectVendor(id: string, adminUid: string, reason: string): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, collections.vendors, id), {
      status: "rejected" as VendorStatus,
      active: false,
      rejectionReason: reason,
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    });
    logger.info("Vendor rejected", { id, adminUid });
    return true;
  } catch (e) {
    logger.error("Failed to reject vendor", { error: e instanceof Error ? e.message : String(e) });
    return false;
  }
}

export async function toggleFeatured(id: string, featured: boolean, adminUid: string): Promise<boolean> {
  return updateVendorAdmin(id, { featured }, adminUid);
}

export async function toggleActive(id: string, active: boolean, adminUid: string): Promise<boolean> {
  return updateVendorAdmin(id, { active }, adminUid);
}

export async function bulkApprove(ids: string[], adminUid: string): Promise<void> {
  await Promise.all(ids.map((id) => approveVendor(id, adminUid)));
}

export async function bulkReject(ids: string[], adminUid: string, reason: string): Promise<void> {
  await Promise.all(ids.map((id) => rejectVendor(id, adminUid, reason)));
}

export async function bulkDelete(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteVendor(id)));
}

export async function bulkSetFeatured(ids: string[], featured: boolean, adminUid: string): Promise<void> {
  await Promise.all(ids.map((id) => toggleFeatured(id, featured, adminUid)));
}

export async function bulkSetActive(ids: string[], active: boolean, adminUid: string): Promise<void> {
  await Promise.all(ids.map((id) => toggleActive(id, active, adminUid)));
}

export interface VendorAnalytics {
  total: number;
  active: number;
  pending: number;
  featured: number;
  categories: number;
}

export async function getVendorAnalytics(vendors: VendorDocument[]): Promise<VendorAnalytics> {
  const categories = new Set(vendors.map((v) => v.category));
  return {
    total: vendors.length,
    active: vendors.filter((v) => v.active !== false && v.status === "approved").length,
    pending: vendors.filter((v) => v.status === "pending").length,
    featured: vendors.filter((v) => v.featured).length,
    categories: categories.size,
  };
}

export function filterVendors(vendors: VendorDocument[], filter: VendorFilter): VendorDocument[] {
  switch (filter) {
    case "pending": return vendors.filter((v) => v.status === "pending");
    case "approved": return vendors.filter((v) => v.status === "approved");
    case "rejected": return vendors.filter((v) => v.status === "rejected");
    case "featured": return vendors.filter((v) => v.featured);
    case "active": return vendors.filter((v) => v.active !== false);
    case "inactive": return vendors.filter((v) => v.active === false);
    default: return vendors;
  }
}

export function searchVendors(vendors: VendorDocument[], query: string): VendorDocument[] {
  if (!query.trim()) return vendors;
  const q = query.toLowerCase().trim();
  return vendors.filter((v) =>
    v.businessName?.toLowerCase().includes(q) ||
    v.category?.toLowerCase().includes(q) ||
    v.city?.toLowerCase().includes(q) ||
    v.ownerName?.toLowerCase().includes(q) ||
    v.phone?.toLowerCase().includes(q)
  );
}
