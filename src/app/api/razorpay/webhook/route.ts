import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

interface RazorpayEvent {
  entity: "event";
  account_id?: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id?: string;
        amount: number;
        currency: string;
        status: string;
        method?: string;
        email?: string;
        contact?: string;
      };
    };
    refund?: {
      entity: {
        id: string;
        payment_id: string;
        amount: number;
        status: string;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  const expectedSig = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  if (expectedSig !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = getDb();
  const now = new Date();

  try {
    switch (event.event) {
      case "payment.captured":
      case "payment.authorized": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;
        const snap = await db.collection("payments").where("orderId", "==", payment.order_id).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0]!.ref.update({
            status: "paid",
            gatewayPaymentId: payment.id,
            paymentMethod: payment.method ?? "razorpay",
            paymentDate: now,
            updatedAt: now,
          });
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;
        const snap = await db.collection("payments").where("orderId", "==", payment.order_id).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0]!.ref.update({
            status: "failed",
            gatewayPaymentId: payment.id,
            updatedAt: now,
          });
        }
        break;
      }

      case "refund.processed": {
        const refund = event.payload.refund?.entity;
        if (!refund) break;
        const snap = await db.collection("payments").where("gatewayPaymentId", "==", refund.payment_id).limit(1).get();
        if (!snap.empty) {
          const payRef = snap.docs[0]!;
          await payRef.ref.update({
            status: "refunded",
            refundedAt: now,
            updatedAt: now,
          });

          // Deactivate subscription
          const payData = payRef.data() as { uid?: string };
          if (payData.uid) {
            const subSnap = await db.collection("subscriptions")
              .where("uid", "==", payData.uid)
              .where("status", "==", "active")
              .get();
            const batch = db.batch();
            subSnap.docs.forEach((d) => batch.update(d.ref, { status: "refunded", updatedAt: now }));
            await batch.commit();
          }
        }
        break;
      }

      default:
        // Unhandled event — acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[razorpay webhook] Error processing event:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
