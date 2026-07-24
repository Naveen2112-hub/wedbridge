import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";
import type { MembershipTier } from "@/firebase/schema";
import { checkRateLimit, getClientIP } from "@/lib/security/securityService";
import { createInvoice, updateInvoiceStatus } from "@/lib/membership/invoiceService";

export const runtime = "nodejs";

const PLAN_PRICES: Record<string, number> = { premium: 99900, gold: 199900 };

interface VerifyBody {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  plan: MembershipTier;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIP(req);
  const rl = checkRateLimit(`razorpay-verify:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
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

    const db = getDb();
    const now = new Date();

    const paySnap = await db.collection("payments").doc(paymentId).get();
    if (!paySnap.exists) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }
    const payData = paySnap.data() as { uid?: string; orderId?: string; amount?: number; status?: string; userName?: string; userEmail?: string };
    if (payData.uid !== user.uid) {
      return NextResponse.json({ error: "Payment does not belong to this user" }, { status: 403 });
    }
    if (payData.orderId !== razorpayOrderId) {
      return NextResponse.json({ error: "Order ID mismatch" }, { status: 400 });
    }

    const expectedAmount = PLAN_PRICES[plan];
    if (!expectedAmount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (payData.amount !== expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Idempotency: already processed
    if (payData.status === "paid") {
      return NextResponse.json({ verified: true, alreadyVerified: true, membershipStatus: "active", membershipPlan: plan });
    }

    // Signature failed — mark as failed
    if (!isValid) {
      await db.collection("payments").doc(paymentId).update({
        status: "failed",
        gatewayPaymentId: razorpayPaymentId,
        updatedAt: now,
      }).catch(() => {});
      return NextResponse.json({ verified: false, error: "Signature verification failed" }, { status: 400 });
    }

    const startDate = now;
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

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
      uid: user.uid,
      plan,
      status: "active",
      membershipStatus: "active",
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

    const userRef = db.collection("users").doc(user.uid);
    batch.update(userRef, {
      membershipTier: plan,
      membershipStatus: "active",
      membershipPlan: plan,
      paymentProvider: "Razorpay",
      updatedAt: now,
    });

    await batch.commit();

    // Generate invoice asynchronously
    await createInvoice({
      paymentId,
      uid: user.uid,
      plan,
      amount: expectedAmount,
      currency: "INR",
      paymentDate: now,
      paymentMethod: "razorpay",
      status: "paid",
      userName: payData.userName ?? "",
      userEmail: payData.userEmail ?? "",
    }).catch(() => {});

    return NextResponse.json({
      verified: true,
      membershipStatus: "active",
      membershipPlan: plan,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      paymentDate: now.toISOString(),
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH — update payment status (for handling failed/cancelled/refunded from webhook or admin)
 */
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { paymentId: string; status: "failed" | "cancelled" | "refunded"; invoiceNumber?: string };
    if (!body.paymentId || !body.status) {
      return NextResponse.json({ error: "Missing paymentId or status" }, { status: 400 });
    }

    const db = getDb();
    const now = new Date();

    const payRef = db.collection("payments").doc(body.paymentId);
    const snap = await payRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    const payData = snap.data() as { uid?: string; status?: string };
    if (payData.uid !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { status: body.status, updatedAt: now };

    if (body.status === "refunded") {
      updateData.refundedAt = now;
      // Deactivate subscription
      const subSnap = await db.collection("subscriptions").where("uid", "==", user.uid).where("status", "==", "active").get();
      const batch = db.batch();
      batch.update(payRef, updateData);
      subSnap.docs.forEach((d) => batch.update(d.ref, { status: "refunded", updatedAt: now }));
      await batch.commit();
    } else if (body.status === "cancelled") {
      updateData.cancelledAt = now;
      await payRef.update(updateData);
    } else {
      await payRef.update(updateData);
    }

    if (body.invoiceNumber) {
      await updateInvoiceStatus(body.invoiceNumber, body.status).catch(() => {});
    }

    return NextResponse.json({ success: true, status: body.status });
  } catch (err) {
    console.error("Payment status update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
