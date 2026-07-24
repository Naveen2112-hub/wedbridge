import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert, type AppOptions } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
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

async function verifyToken(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) return null;
  try {
    const decoded = await getAuth(getApps().length ? getApps()[0] : initializeApp(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID } : {})).verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

interface CreateOrderBody {
  plan: MembershipTier;
}

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyToken(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as CreateOrderBody;
    if (!body.plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
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

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount, currency: "INR", payment_capture: 1, notes: { uid, plan: body.plan } }),
    });

    if (!rzpRes.ok) {
      const errText = await rzpRes.text();
      console.error("Razorpay order creation failed:", rzpRes.status, errText);
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 502 });
    }

    const rzpOrder = (await rzpRes.json()) as { id: string; amount: number; currency: string; status: string };

    const db = getAdminDb();
    const payRef = await db.collection("payments").add({
      uid,
      userId: uid,
      orderId: rzpOrder.id,
      razorpayOrderId: rzpOrder.id,
      gateway: "razorpay",
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      plan: body.plan,
      status: "pending",
      notes: { uid, plan: body.plan },
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
