import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type VendorBookingDocument, type BookingStatus } from "@/firebase/schema";
import { sanitizeText } from "@/lib/utils";

export interface CreateBookingInput { vendorId: string; vendorName: string; userId: string; userName: string; userEmail: string; packageId?: string; preferredDate: string; time: string; guestCount: number; specialNotes?: string; amount: number; }

export async function createBooking(input: CreateBookingInput): Promise<string> {
  if (!db) throw new Error("db-not-configured");
  const sanitized = { ...input, specialNotes: input.specialNotes ? sanitizeText(input.specialNotes) : "" };
  const ref = await addDoc(collection(db, collections.vendorBookings), { ...sanitized, status: "pending" as BookingStatus, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as Omit<VendorBookingDocument, "id">);
  return ref.id;
}
export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  if (!db) return;
  try { await updateDoc(doc(db, collections.vendorBookings, id), { status, updatedAt: serverTimestamp() }); } catch { /* ignore */ }
}
export async function getUserBookings(uid: string, max = 50): Promise<VendorBookingDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendorBookings), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorBookingDocument, "id">) })); } catch { return []; }
}
export async function getVendorBookings(vendorId: string, max = 100): Promise<VendorBookingDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendorBookings), where("vendorId", "==", vendorId), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorBookingDocument, "id">) })); } catch { return []; }
}
export async function listAllBookings(max = 100): Promise<VendorBookingDocument[]> {
  if (!db) return [];
  try { const snap = await getDocs(query(collection(db, collections.vendorBookings), orderBy("createdAt", "desc"), limit(max))); return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VendorBookingDocument, "id">) })); } catch { return []; }
}
export async function hasUserBookedVendor(uid: string, vendorId: string): Promise<boolean> {
  if (!db) return false;
  try { const snap = await getDocs(query(collection(db, collections.vendorBookings), where("userId", "==", uid), where("vendorId", "==", vendorId), limit(1))); return !snap.empty; } catch { return false; }
}
