import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

let instance: Razorpay | null = null;

function getInstance(): Razorpay {
  if (instance) return instance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured.");
  }

  instance = new Razorpay({ key_id, key_secret });
  return instance;
}

export interface CreateOrderInput {
  amount: number; // paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: string;
  notes: Record<string, string>;
}

export async function createOrder(input: CreateOrderInput): Promise<RazorpayOrder> {
  const rzp = getInstance();
  const order = await rzp.orders.create({
    amount: input.amount,
    currency: input.currency ?? "INR",
    receipt: input.receipt ?? `wb_${Date.now()}`,
    notes: input.notes ?? {},
  });
  return order as unknown as RazorpayOrder;
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) throw new Error("Razorpay keys are not configured.");

  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac("sha256", key_secret)
    .update(body)
    .digest("hex");

  const received = params.signature.trim();
  if (!received) return false;

  const a = Buffer.from(expected, "utf-8");
  const b = Buffer.from(received, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
