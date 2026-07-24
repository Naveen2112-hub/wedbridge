import { collection, doc, getDoc, getDocs, query, where, serverTimestamp, setDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";

export interface AvailabilitySlot {
  id: string;
  vendorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  notes?: string;
}

export interface VendorAvailability {
  vendorId: string;
  availableDates: string[];
  blackoutDates: string[];
  workingDays: number[];
  workingHours: { start: string; end: string };
  slotDurationMinutes: number;
}

export const DEFAULT_AVAILABILITY: VendorAvailability = {
  vendorId: "",
  availableDates: [],
  blackoutDates: [],
  workingDays: [1, 2, 3, 4, 5, 6],
  workingHours: { start: "09:00", end: "18:00" },
  slotDurationMinutes: 60,
};

export async function getVendorAvailability(vendorId: string): Promise<VendorAvailability | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, collections.vendorAvailability, vendorId));
    if (!snap.exists()) return null;
    return { ...DEFAULT_AVAILABILITY, ...snap.data() } as VendorAvailability;
  } catch {
    return null;
  }
}

export async function updateVendorAvailability(vendorId: string, availability: Partial<VendorAvailability>): Promise<boolean> {
  if (!db) return false;
  try {
    const ref = doc(db, collections.vendorAvailability, vendorId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...availability, updatedAt: serverTimestamp() });
    } else {
      await setDoc(ref, { ...DEFAULT_AVAILABILITY, ...availability, vendorId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    return true;
  } catch {
    return false;
  }
}

export async function getAvailableSlots(vendorId: string, date: string): Promise<AvailabilitySlot[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(
        collection(db, collections.vendorAvailability),
        where("vendorId", "==", vendorId),
        where("date", "==", date),
      ),
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<AvailabilitySlot, "id">) }))
      .filter((s) => !s.isBooked)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  } catch {
    return [];
  }
}

export async function isDateAvailable(vendorId: string, date: string): Promise<boolean> {
  const availability = await getVendorAvailability(vendorId);
  if (!availability) return true;
  if (availability.blackoutDates.includes(date)) return false;
  if (availability.availableDates.length > 0 && !availability.availableDates.includes(date)) return false;
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  if (!availability.workingDays.includes(dayOfWeek)) return false;
  return true;
}

export async function bookSlot(vendorId: string, date: string, startTime: string, endTime: string, bookingId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const ref = doc(collection(db, collections.vendorAvailability));
    await setDoc(ref, {
      vendorId,
      date,
      startTime,
      endTime,
      isBooked: true,
      bookingId,
      bookedAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function releaseSlot(slotId: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, collections.vendorAvailability, slotId));
    return true;
  } catch {
    return false;
  }
}
