import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { getVendorAvailability, updateVendorAvailability, getAvailableSlots, isDateAvailable } from "@/lib/marketplace/availabilityService";
import { checkRateLimit, getClientIP } from "@/lib/security/securityService";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIP(req);
  const rl = checkRateLimit(`availability:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await req.json() as { vendorId: string; availability: Record<string, unknown> };
  if (!body.vendorId) return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });

  const ok = await updateVendorAvailability(body.vendorId, body.availability);
  return NextResponse.json({ success: ok });
}
