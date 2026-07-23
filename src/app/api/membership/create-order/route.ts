import { NextResponse } from "next/server";
import { createOrder } from "@/lib/razorpay-server";
import { getAuthUser } from "@/lib/auth-server";
import { PLANS, type PlanId } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const planId = body.plan as PlanId | undefined;
  const plan = planId ? PLANS[planId] : undefined;
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const order = await createOrder({
      amount: plan.amount,
      currency: "INR",
      receipt: `wb_${user.uid}_${Date.now()}`,
      notes: { uid: user.uid, plan: plan.id },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: plan.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
