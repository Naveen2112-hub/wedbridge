import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
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

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY ?? "";
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const options: AppOptions = projectId ? { projectId } : {};
  if (clientEmail && privateKey) { options.credential = cert({ projectId: projectId ?? "", clientEmail, privateKey }); }
  return initializeApp(options);
}

async function verifyToken(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) return null;
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

interface VerifyBody {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  plan: MembershipTier;
}

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyToken(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as VerifyBody;
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = body;

    if (!paymentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const receivedBuf = Buffer.from(razorpaySignature.trim(), "utf-8");
    let isValid = false;
    if (expectedBuf.length === receivedBuf.length) {
      try { isValid = timingSafeEqual(expectedBuf, receivedBuf); } catch { isValid = false; }
    }

    const db = getAdminDb();
    const now = new Date();
    const startDate = now;
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    if (!isValid) {
      await db.collection("payments").doc(paymentId).update({
        status: "failed",
        gatewayPaymentId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
        updatedAt: now,
      }).catch(() => {});
      return NextResponse.json({ verified: false, error: "Signature verification failed" }, { status: 400 });
    }

    const expectedAmount = PLAN_PRICES[plan];
    if (!expectedAmount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const paySnap = await db.collection("payments").doc(paymentId).get();
    if (!paySnap.exists) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }
    const payData = paySnap.data() as { uid?: string; orderId?: string; amount?: number; status?: string };
    if (payData.uid !== uid) {
      return NextResponse.json({ error: "Payment does not belong to this user" }, { status: 403 });
    }
    if (payData.orderId !== razorpayOrderId) {
      return NextResponse.json({ error: "Order ID mismatch" }, { status: 400 });
    }
    if (payData.amount !== expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }
    if (payData.status === "paid") {
      return NextResponse.json({ verified: true, alreadyVerified: true, membershipStatus: "active", membershipPlan: plan });
    }

    const batch = db.batch();

    const payRef = db.collection("payments").doc(paymentId);
    batch.update(payRef, {
      status: "paid",
      gatewayPaymentId: razorpayPaymentId,
      gatewaySignature: razorpaySignature,
      paymentMethod: "razorpay",
      paymentDate: now,
      updatedAt: now,
    });

    const subRef = db.collection("subscriptions").doc();
    batch.create(subRef, {
      uid,
      plan,
      status: "active",
      membershipStatus: "active",
      paymentStatus: "paid",
      membershipPlan: plan,
      paymentProvider: "Razorpay",
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      paymentDate: now,
      startDate,
      expiryDate,
      endDate: expiryDate,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });

    const userRef = db.collection("users").doc(uid);
    batch.update(userRef, {
      membershipTier: plan,
      membershipStatus: "active",
      paymentStatus: "paid",
      membershipPlan: plan,
      paymentProvider: "Razorpay",
      updatedAt: now,
    });

    await batch.commit();

    return NextResponse.json({
      verified: true,
      membershipStatus: "active",
      paymentStatus: "paid",
      membershipPlan: plan,
      paymentProvider: "Razorpay",
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      paymentDate: now.toISOString(),
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
    });
  } catch (err) {
    console.error("verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
