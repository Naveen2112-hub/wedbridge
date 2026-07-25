import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { getVendorAvailability, updateVendorAvailability, getAvailableSlots } from "@/lib/marketplace/availabilityService";
import { checkRateLimit, getClientIP } from "@/lib/security/securityService";
import { getDb } from "@/lib/firebase-admin";
import { collections } from "@/firebase/schema";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const date = searchParams.get("date");

    if (!vendorId) return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });

    if (date) {
      const slots = await getAvailableSlots(vendorId, date);
      return NextResponse.json({ slots });
    }

    const availability = await getVendorAvailability(vendorId);
    return NextResponse.json({ availability });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = getClientIP(req);
    const rl = checkRateLimit(`availability:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 20 });
    if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const body = await req.json() as { vendorId: string; availability: Record<string, unknown> };
    if (!body.vendorId) return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });

    // Ownership check: the authenticated user must own this vendor profile
    const db = getDb();
    const vendorSnap = await db.collection(collections.vendors).doc(body.vendorId).get();
    if (!vendorSnap.exists) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    const vendorData = vendorSnap.data();
    if (!vendorData) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    if (vendorData.uid !== user.uid && vendorData.ownerId !== user.uid) {
      return NextResponse.json({ error: "Forbidden: you do not own this vendor profile" }, { status: 403 });
    }

    const ok = await updateVendorAvailability(body.vendorId, body.availability);
    return NextResponse.json({ success: ok });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
