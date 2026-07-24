import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";
import { createOrder } from "@/lib/razorpay-server";
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

    const order = await createOrder({
      amount,
      currency: "INR",
      receipt: `wb_${user.uid}_${Date.now()}`,
      notes: { uid: user.uid, plan: body.plan },
    });

    const db = getDb();
    const payRef = await db.collection("payments").add({
      uid: user.uid,
      userId: user.uid,
      orderId: order.id,
      razorpayOrderId: order.id,
      gateway: "razorpay",
      amount: order.amount,
      currency: order.currency,
      plan: body.plan,
      status: "pending",
      notes: { uid: user.uid, plan: body.plan },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      orderId: order.id,
      paymentId: payRef.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
