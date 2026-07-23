import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { initializeApp, getApps, cert, type AppOptions } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { MembershipTier } from "@/firebase/schema";

export const runtime = "nodejs";

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

interface VerifyBody {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  uid: string;
  plan: MembershipTier;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VerifyBody;
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, uid, plan } = body;

    if (!paymentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !uid || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    // Verify the HMAC-SHA256 signature
    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const isValid = expectedSignature === razorpaySignature;
    const db = getAdminDb();
    const now = new Date();
    const startDate = now;
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    if (!isValid) {
      // Mark payment as failed
      await db.collection("payments").doc(paymentId).update({
        status: "failed",
        gatewayPaymentId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
        updatedAt: now,
      });
      return NextResponse.json({ verified: false, error: "Signature verification failed" }, { status: 400 });
    }

    // Signature is valid — update payment and activate membership
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

    // Create subscription with all required fields
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

    // Update user's membership tier
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
