/**
 * Wedding Planner Service
 * Planning dashboard: budget, guests, checklist, vendor booking, invitation tracking, timeline, payments.
 */
import { db } from "@/firebase/config";
import { collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { collections } from "@/firebase/schema";

export interface WeddingPlan {
  id?: string;
  uid: string;
  partnerName?: string;
  weddingDate?: string;
  venue?: string;
  budget: BudgetBreakdown;
  guests: GuestList;
  checklist: ChecklistItem[];
  timeline: TimelineEvent[];
  invitationStatus: InvitationStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BudgetBreakdown {
  total: number;
  spent: number;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
}

export interface GuestList {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
  guests: GuestEntry[];
}

export interface GuestEntry {
  name: string;
  side: "bride" | "groom";
  relation: string;
  rsvp: "confirmed" | "pending" | "declined";
  plusOne: boolean;
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: "venue" | "catering" | "decoration" | "photography" | "invitation" | "attire" | "jewellery" | "transport" | "other";
  deadline?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  duration: number;
  location?: string;
  notes?: string;
}

export interface InvitationStatus {
  sent: number;
  delivered: number;
  opened: number;
  rsvpYes: number;
  rsvpNo: number;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "1", task: "Fix wedding date", category: "venue", completed: false, priority: "high" },
  { id: "2", task: "Book marriage hall", category: "venue", completed: false, priority: "high" },
  { id: "3", task: "Book caterer", category: "catering", completed: false, priority: "high" },
  { id: "4", task: "Book photographer", category: "photography", completed: false, priority: "high" },
  { id: "5", task: "Book decorator", category: "decoration", completed: false, priority: "medium" },
  { id: "6", task: "Order invitations", category: "invitation", completed: false, priority: "medium" },
  { id: "7", task: "Buy wedding attire", category: "attire", completed: false, priority: "medium" },
  { id: "8", task: "Buy jewellery", category: "jewellery", completed: false, priority: "medium" },
  { id: "9", task: "Arrange transport", category: "transport", completed: false, priority: "low" },
  { id: "10", task: "Book makeup artist", category: "other", completed: false, priority: "medium" },
];

const DEFAULT_BUDGET: BudgetBreakdown = {
  total: 500000,
  spent: 0,
  categories: [
    { name: "Venue", allocated: 150000, spent: 0 },
    { name: "Catering", allocated: 100000, spent: 0 },
    { name: "Photography", allocated: 50000, spent: 0 },
    { name: "Decoration", allocated: 40000, spent: 0 },
    { name: "Attire", allocated: 50000, spent: 0 },
    { name: "Jewellery", allocated: 80000, spent: 0 },
    { name: "Invitations", allocated: 15000, spent: 0 },
    { name: "Transport", allocated: 15000, spent: 0 },
  ],
};

/**
 * Create a new wedding plan for a user.
 */
export async function createWeddingPlan(uid: string): Promise<{ id: string }> {
  if (!db) throw new Error("Database unavailable");
  const plan: Omit<WeddingPlan, "id" | "createdAt" | "updatedAt"> = {
    uid,
    budget: DEFAULT_BUDGET,
    guests: { total: 0, confirmed: 0, pending: 0, declined: 0, guests: [] },
    checklist: DEFAULT_CHECKLIST,
    timeline: [],
    invitationStatus: { sent: 0, delivered: 0, opened: 0, rsvpYes: 0, rsvpNo: 0 },
  };
  const docRef = await addDoc(collection(db, collections.weddingPlanner), {
    ...plan,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id };
}

/**
 * Get a user's wedding plan.
 */
export async function getWeddingPlan(uid: string): Promise<WeddingPlan | null> {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, collections.weddingPlanner), where("uid", "==", uid), limit(1)));
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<WeddingPlan, "id">) };
  } catch {
    return null;
  }
}

/**
 * Update wedding plan fields.
 */
export async function updateWeddingPlan(
  planId: string,
  updates: Partial<WeddingPlan>,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, collections.weddingPlanner, planId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update budget category.
 */
export async function updateBudgetCategory(
  planId: string,
  categoryName: string,
  allocated?: number,
  spent?: number,
): Promise<void> {
  if (!db) return;
  const planRef = doc(db, collections.weddingPlanner, planId);
  const snap = await getDoc(planRef);
  if (!snap.exists()) return;
  const plan = snap.data() as WeddingPlan;
  const categories = plan.budget.categories.map((c) =>
    c.name === categoryName
      ? { ...c, allocated: allocated ?? c.allocated, spent: spent ?? c.spent }
      : c
  );
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
  await updateDoc(planRef, {
    "budget.categories": categories,
    "budget.spent": totalSpent,
    "budget.total": totalAllocated,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle checklist item.
 */
export async function toggleChecklistItem(
  planId: string,
  itemId: string,
  completed: boolean,
): Promise<void> {
  if (!db) return;
  const planRef = doc(db, collections.weddingPlanner, planId);
  const snap = await getDoc(planRef);
  if (!snap.exists()) return;
  const plan = snap.data() as WeddingPlan;
  const checklist = plan.checklist.map((item) =>
    item.id === itemId ? { ...item, completed } : item
  );
  await updateDoc(planRef, { checklist, updatedAt: serverTimestamp() });
}

/**
 * Add a guest.
 */
export async function addGuest(planId: string, guest: GuestEntry): Promise<void> {
  if (!db) return;
  const planRef = doc(db, collections.weddingPlanner, planId);
  const snap = await getDoc(planRef);
  if (!snap.exists()) return;
  const plan = snap.data() as WeddingPlan;
  const guests = [...plan.guests.guests, guest];
  const total = guests.length;
  const confirmed = guests.filter((g) => g.rsvp === "confirmed").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const declined = guests.filter((g) => g.rsvp === "declined").length;
  await updateDoc(planRef, {
    "guests.guests": guests,
    "guests.total": total,
    "guests.confirmed": confirmed,
    "guests.pending": pending,
    "guests.declined": declined,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Add a timeline event.
 */
export async function addTimelineEvent(planId: string, event: TimelineEvent): Promise<void> {
  if (!db) return;
  const planRef = doc(db, collections.weddingPlanner, planId);
  const snap = await getDoc(planRef);
  if (!snap.exists()) return;
  const plan = snap.data() as WeddingPlan;
  const timeline = [...plan.timeline, event].sort((a, b) => a.time.localeCompare(b.time));
  await updateDoc(planRef, { timeline, updatedAt: serverTimestamp() });
}
