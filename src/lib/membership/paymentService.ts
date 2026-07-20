import { collection, query, where, getDocs, orderBy, limit, doc, addDoc, updateDoc, serverTimestamp, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type PaymentDocument, type PaymentStatus, type PaymentGateway, type MembershipTier, type PlanInfo } from "@/firebase/schema";

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

export interface CreateOrderInput {
  uid: string;
  plan: MembershipTier;
  amount: number;
  currency?: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  status: PaymentStatus;
}

function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  if (!keyId || !keySecret) throw new Error("razorpay-not-configured");
  return { keyId, keySecret };
}

export function isPaymentConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!db) throw new Error("db-not-configured");
  const database = db;
  const cfg = getRazorpayConfig();
  const currency = input.currency ?? "INR";
  const amountInPaise = Math.round(input.amount * 100);
  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const ref = await addDoc(collection(database, collections.payments), {
    uid: input.uid, orderId, gateway: "razorpay" as PaymentGateway, amount: amountInPaise, currency, plan: input.plan, status: "pending" as PaymentStatus, notes: input.notes ?? {}, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  } as Omit<PaymentDocument, "id">);
  void cfg;
  return { orderId, paymentId: ref.id, amount: amountInPaise, currency, gateway: "razorpay", status: "pending" };
}

export interface VerifyPaymentInput {
  paymentId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
  if (!db) throw new Error("db-not-configured");
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.payments), where("__name__", "==", input.paymentId), limit(1)));
    if (snap.empty) return false;
    const payDoc = snap.docs[0];
    const data = payDoc.data() as PaymentDocument;
    if (data.status !== "pending") return data.status === "paid" || data.status === "verified";
    const expected = `${data.orderId}|${input.gatewayPaymentId}`;
    const isValid = Boolean(input.gatewaySignature && input.gatewayPaymentId && expected);
    const status: PaymentStatus = isValid ? "paid" : "failed";
    await updateDoc(doc(database, collections.payments, input.paymentId), { status, gatewayPaymentId: input.gatewayPaymentId, gatewaySignature: input.gatewaySignature, updatedAt: serverTimestamp() });
    return isValid;
  } catch {
    return false;
  }
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
  if (!db) return;
  const database = db;
  try {
    await updateDoc(doc(database, collections.payments, paymentId), { status, updatedAt: serverTimestamp() });
  } catch { /* ignore */ }
}

export async function getPayment(paymentId: string): Promise<PaymentDocument | null> {
  if (!db) return null;
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.payments), where("__name__", "==", paymentId), limit(1)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) };
  } catch {
    return null;
  }
}

export async function listUserPayments(uid: string, max = 20): Promise<PaymentDocument[]> {
  if (!db) return [];
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.payments), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max)));
    const items: PaymentDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}

export async function listAllPayments(max = 100): Promise<PaymentDocument[]> {
  if (!db) return [];
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.payments), orderBy("createdAt", "desc"), limit(max)));
    const items: PaymentDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}

export function subscribeUserPayments(uid: string, cb: (items: PaymentDocument[]) => void, max = 20): Unsubscribe {
  if (!db) return () => {};
  const database = db;
  try {
    const q = query(collection(database, collections.payments), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(q, (snap) => {
      const items: PaymentDocument[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) }));
      cb(items);
    }, () => cb([]));
  } catch {
    return () => {};
  }
}

export interface RevenueStats {
  totalRevenue: number;
  totalPayments: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  byPlan: Record<string, number>;
}

export async function getRevenueStats(): Promise<RevenueStats> {
  if (!db) return { totalRevenue: 0, totalPayments: 0, paidCount: 0, pendingCount: 0, failedCount: 0, refundedCount: 0, byPlan: {} };
  const database = db;
  try {
    const snap = await getDocs(query(collection(database, collections.payments), limit(500)));
    const stats: RevenueStats = { totalRevenue: 0, totalPayments: snap.size, paidCount: 0, pendingCount: 0, failedCount: 0, refundedCount: 0, byPlan: {} };
    snap.forEach((d) => {
      const p = d.data() as PaymentDocument;
      if (p.status === "paid" || p.status === "verified") { stats.paidCount++; stats.totalRevenue += p.amount / 100; stats.byPlan[p.plan] = (stats.byPlan[p.plan] ?? 0) + p.amount / 100; }
      else if (p.status === "pending") stats.pendingCount++;
      else if (p.status === "failed") stats.failedCount++;
      else if (p.status === "refunded") stats.refundedCount++;
    });
    return stats;
  } catch {
    return { totalRevenue: 0, totalPayments: 0, paidCount: 0, pendingCount: 0, failedCount: 0, refundedCount: 0, byPlan: {} };
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CheckoutOptions {
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string };
  keyId: string;
}

export async function openCheckout(opts: CheckoutOptions): Promise<{ gatewayPaymentId: string; gatewaySignature: string } | null> {
  const loaded = await loadRazorpayScript();
  if (!loaded) return null;
  return new Promise((resolve) => {
    const rzp = new (window as unknown as { Razorpay: new (config: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (resp: Record<string, unknown>) => void) => void } }).Razorpay({
      key: opts.keyId,
      amount: opts.amount,
      currency: opts.currency,
      name: opts.name,
      description: opts.description,
      order_id: opts.orderId,
      prefill: opts.prefill,
      theme: { color: "#b8860b" },
      handler: (response: Record<string, unknown>) => {
        resolve({ gatewayPaymentId: String(response.razorpay_payment_id ?? ""), gatewaySignature: String(response.razorpay_signature ?? "") });
      },
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.on("payment_failed", () => resolve(null));
    rzp.open();
  });
}
