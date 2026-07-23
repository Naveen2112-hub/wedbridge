import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert, type AppOptions } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { MembershipTier } from "@/firebase/schema";

export const runtime = "nodejs";

const PLAN_PRICES: Record<string, number> = { premium: 99900, gold: 199900 };

let adminDb: Firestore | null = null;

function getAdminDb(): Firestore {
  if (adminDb) return adminDb;
  if (getApps().length) { adminDb = getFirestore(); return adminDb; }
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "wedbridge-db0e2";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY ?? "";
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const options: AppOptions = projectId ? { projectId } : {};
  if (clientEmail && privateKey) { options.credential = cert({ projectId, clientEmail, privateKey }); }
  initializeApp(options);
  adminDb = getFirestore();
  return adminDb;
}

interface CreateOrderBody {
  uid: string;
  plan: MembershipTier;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderBody;
    if (!body.uid || !body.plan) {
      return NextResponse.json({ error: "Missing uid or plan" }, { status: 400 });
    }
    const amount = PLAN_PRICES[body.plan];
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan. Must be premium or gold." }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    // Create a real Razorpay order via the REST API
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount, currency: "INR", payment_capture: 1, notes: { uid: body.uid, plan: body.plan } }),
    });

    if (!rzpRes.ok) {
      const errText = await rzpRes.text();
      console.error("Razorpay order creation failed:", rzpRes.status, errText);
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 502 });
    }

    const rzpOrder = (await rzpRes.json()) as { id: string; amount: number; currency: string; status: string };

    // Store a pending payment record in Firestore
    const db = getAdminDb();
    const payRef = await db.collection("payments").add({
      uid: body.uid,
      userId: body.uid,
      orderId: rzpOrder.id,
      razorpayOrderId: rzpOrder.id,
      gateway: "razorpay",
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      plan: body.plan,
      status: "pending",
      notes: { uid: body.uid, plan: body.plan },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      orderId: rzpOrder.id,
      paymentId: payRef.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId,
    });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
