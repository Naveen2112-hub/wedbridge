import "server-only";
import { getDb } from "@/lib/firebase-admin";
import type { MembershipTier } from "@/firebase/schema";

export interface InvoiceData {
  invoiceNumber: string;
  paymentId: string;
  uid: string;
  plan: MembershipTier;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: string;
  status: "paid" | "failed" | "refunded" | "cancelled";
  userName: string;
  userEmail: string;
  gstin?: string;
  billingAddress?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const PLAN_NAMES: Record<string, string> = {
  premium: "WedBridge Premium Membership (1 Year)",
  gold: "WedBridge Gold Membership (1 Year)",
  free: "WedBridge Free Plan",
};

const PLAN_GST_RATE = 0.18;

export function generateInvoiceNumber(paymentId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const seq = paymentId.substring(0, 8).toUpperCase();
  return `WB-${year}${month}-${seq}`;
}

export function buildInvoiceLineItems(plan: MembershipTier, amountInPaise: number): InvoiceLineItem[] {
  const baseAmount = Math.round(amountInPaise / (1 + PLAN_GST_RATE));
  const gstAmount = amountInPaise - baseAmount;
  return [
    {
      description: PLAN_NAMES[plan] ?? `WedBridge ${plan} Membership`,
      quantity: 1,
      unitPrice: baseAmount,
      total: baseAmount,
    },
    {
      description: `GST @ ${PLAN_GST_RATE * 100}%`,
      quantity: 1,
      unitPrice: gstAmount,
      total: gstAmount,
    },
  ];
}

export async function createInvoice(data: Omit<InvoiceData, "invoiceNumber">): Promise<InvoiceData | null> {
  try {
    const db = getDb();
    const invoiceNumber = generateInvoiceNumber(data.paymentId);
    const invoice: InvoiceData = { ...data, invoiceNumber };
    await db.collection("invoices").doc(invoiceNumber).set({
      ...invoice,
      paymentDate: data.paymentDate,
      createdAt: new Date(),
      lineItems: buildInvoiceLineItems(data.plan, data.amount),
    });
    return invoice;
  } catch (err) {
    console.error("[invoice] Failed to create invoice:", err);
    return null;
  }
}

export async function getInvoice(invoiceNumber: string): Promise<InvoiceData | null> {
  try {
    const db = getDb();
    const snap = await db.collection("invoices").doc(invoiceNumber).get();
    if (!snap.exists) return null;
    return snap.data() as InvoiceData;
  } catch {
    return null;
  }
}

export async function getInvoicesByUser(uid: string): Promise<InvoiceData[]> {
  try {
    const db = getDb();
    const snap = await db.collection("invoices").where("uid", "==", uid).orderBy("paymentDate", "desc").get();
    return snap.docs.map((d) => d.data() as InvoiceData);
  } catch {
    return [];
  }
}

export async function updateInvoiceStatus(invoiceNumber: string, status: InvoiceData["status"]): Promise<void> {
  try {
    const db = getDb();
    await db.collection("invoices").doc(invoiceNumber).update({ status, updatedAt: new Date() });
  } catch (err) {
    console.error("[invoice] Failed to update invoice status:", err);
  }
}
