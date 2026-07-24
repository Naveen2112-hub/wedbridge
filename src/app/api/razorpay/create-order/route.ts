import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";
import type { MembershipTier } from "@/firebase/schema";
import { checkRateLimit, getClientIP } from "@/lib/security/securityService";

export const runtime = "nodejs";

const PLAN_PRICES: Record<string, number> = { premium: 99900, gold: 199900 };

interface CreateOrderBody {
  plan: MembershipTier;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIP(req);
  const rl = checkRateLimit(`razorpay-order:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
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
      body: JSON.stringify({ amount, currency: "INR", payment_capture: 1, notes: { uid: user.uid, plan: body.plan } }),
    });

    if (!rzpRes.ok) {
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 502 });
    }

    const rzpOrder = (await rzpRes.json()) as { id: string; amount: number; currency: string; status: string };

    const db = getDb();
    const payRef = await db.collection("payments").add({
      uid: user.uid,
      userId: user.uid,
      orderId: rzpOrder.id,
      razorpayOrderId: rzpOrder.id,
      gateway: "razorpay",
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      plan: body.plan,
      status: "pending",
      notes: { uid: user.uid, plan: body.plan },
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
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
