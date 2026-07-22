/**
 * UPI Payment Service
 * Generates UPI payment links for PhonePe, Google Pay, Paytm, and generic UPI.
 * Also generates invoices with GST.
 */
import { db } from "@/firebase/config";
import { collection, doc, addDoc, getDoc, getDocs, query, where, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { collections, type PaymentDocument, type PaymentGateway } from "@/firebase/schema";

export interface UpiPaymentRequest {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  note: string;
  transactionRef: string;
}

export interface UpiPaymentLink {
  upiId: string;
  upiLink: string;
  phonepeLink: string;
  gpayLink: string;
  paytmLink: string;
  qrCodeData: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod?: PaymentGateway;
  transactionId?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const DEFAULT_UPI_VPA = process.env.UPI_VPA ?? "wedbridge@upi";
const DEFAULT_PAYEE_NAME = "WedBridge";
const GST_RATE = 0.18;

/**
 * Generate UPI payment links for all major UPI apps.
 */
export function generateUpiLinks(request: UpiPaymentRequest): UpiPaymentLink {
  const { payeeVpa, payeeName, amount, note, transactionRef } = request;

  const baseParams = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: String(amount),
    cu: "INR",
    tn: note,
    tr: transactionRef,
  });

  const upiLink = `upi://pay?${baseParams.toString()}`;

  return {
    upiId: payeeVpa,
    upiLink,
    phonepeLink: `phonepe://pay?${baseParams.toString()}`,
    gpayLink: `tez://upi/pay?${baseParams.toString()}`,
    paytmLink: `paytmmp://pay?${baseParams.toString()}`,
    qrCodeData: upiLink,
  };
}

/**
 * Generate an invoice with GST for a membership payment.
 */
export function generateInvoice(
  user: { name: string; email: string; phone: string; address?: string },
  planName: string,
  amount: number,
  paymentMethod: PaymentGateway,
  transactionId?: string,
): InvoiceData {
  const invoiceNumber = `WB-${Date.now().toString(36).toUpperCase()}`;
  const invoiceDate = new Date().toISOString().slice(0, 10);

  const subtotal = Math.round(amount / (1 + GST_RATE));
  const gstAmount = amount - subtotal;

  return {
    invoiceNumber,
    invoiceDate,
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: user.phone,
    customerAddress: user.address,
    items: [
      {
        description: `${planName} Membership - 1 Year`,
        quantity: 1,
        unitPrice: subtotal,
        amount: subtotal,
      },
    ],
    subtotal,
    gstRate: GST_RATE * 100,
    gstAmount,
    total: amount,
    paymentStatus: transactionId ? "paid" : "pending",
    paymentMethod,
    transactionId,
  };
}

/**
 * Create a payment record with UPI details.
 */
export async function createUpiPayment(params: {
  userId: string;
  userName: string;
  amount: number;
  plan: string;
}): Promise<{ paymentId: string; upiLinks: UpiPaymentLink }> {
  if (!db) throw new Error("Database unavailable");

  const transactionRef = `WB${Date.now()}`;
  const paymentData: Omit<PaymentDocument, "id" | "createdAt"> = {
    userId: params.userId,
    userName: params.userName,
    amount: params.amount,
    currency: "INR",
    status: "pending",
    gateway: "upi",
    plan: params.plan,
    transactionId: transactionRef,
  };

  const docRef = await addDoc(collection(db, collections.payments), {
    ...paymentData,
    createdAt: serverTimestamp(),
  });

  const upiLinks = generateUpiLinks({
    payeeVpa: DEFAULT_UPI_VPA,
    payeeName: DEFAULT_PAYEE_NAME,
    amount: params.amount,
    note: `${params.plan} Membership`,
    transactionRef,
  });

  return { paymentId: docRef.id, upiLinks };
}

/**
 * Get payment history for a user.
 */
export async function getPaymentHistory(userId: string): Promise<PaymentDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.payments), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(50)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentDocument, "id">) }));
  } catch {
    return [];
  }
}

/**
 * Mark a UPI payment as paid (manual confirmation).
 */
export async function confirmUpiPayment(
  paymentId: string,
  transactionId: string,
): Promise<void> {
  if (!db) return;
  const { updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, collections.payments, paymentId), {
    status: "success",
    transactionId,
    paidAt: serverTimestamp(),
  });
}
