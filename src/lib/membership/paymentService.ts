import { collection, query, where, getDocs, orderBy, limit, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type PaymentDocument, type PaymentStatus, type MembershipTier } from "@/firebase/schema";

export function isPaymentConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
}

export interface CreateOrderInput {
  uid: string;
  plan: MembershipTier;
  amount: number;
}

export interface CreateOrderResult {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const res = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: input.uid, plan: input.plan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to create order");
  }
  return res.json();
}

export interface VerifyPaymentInput {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  uid: string;
  plan: MembershipTier;
}

export interface VerifyPaymentResult {
  verified: boolean;
  membershipStatus: string;
  paymentStatus: string;
  membershipPlan: string;
  paymentProvider: string;
  paymentId: string;
  orderId: string;
  paymentDate: string;
  startDate: string;
  expiryDate: string;
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  const res = await fetch("/api/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.verified) {
    throw new Error(data.error ?? "Signature verification failed");
  }
  return data as VerifyPaymentResult;
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
  // Payment status is now managed server-side during verification.
  // This is kept for compatibility but is a no-op on the client.
  void paymentId;
  void status;
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

export async function openCheckout(opts: CheckoutOptions): Promise<{ gatewayPaymentId: string; gatewayOrderId: string; gatewaySignature: string } | null> {
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
      theme: { color: "#a51d3c" },
      handler: (response: Record<string, unknown>) => {
        resolve({
          gatewayPaymentId: String(response.razorpay_payment_id ?? ""),
          gatewayOrderId: String(response.razorpay_order_id ?? ""),
          gatewaySignature: String(response.razorpay_signature ?? ""),
        });
      },
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.on("payment_failed", () => resolve(null));
    rzp.open();
  });
}

export async function getPayment(paymentId: string): Promise<PaymentDocument | null> {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, collections.payments), where("__name__", "==", paymentId), limit(1)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) };
  } catch {
    return null;
  }
}

export async function listUserPayments(uid: string, max = 20): Promise<PaymentDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.payments), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max)));
    const items: PaymentDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}

export async function listAllPayments(max = 100): Promise<PaymentDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.payments), orderBy("createdAt", "desc"), limit(max)));
    const items: PaymentDocument[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) }));
    return items;
  } catch {
    return [];
  }
}

export function subscribeUserPayments(uid: string, cb: (items: PaymentDocument[]) => void, max = 20): Unsubscribe {
  if (!db) return () => {};
  try {
    const q = query(collection(db, collections.payments), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max));
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
  try {
    const snap = await getDocs(query(collection(db, collections.payments), limit(500)));
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
