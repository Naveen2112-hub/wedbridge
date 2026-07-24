import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { reportUser } from "@/lib/user/reportService";
import { checkRateLimit, getClientIP, sanitizeInput } from "@/lib/security/securityService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIP(req);
  const rl = checkRateLimit(`report:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await req.json() as { reportedUid: string; reason: string; description: string };
  if (!body.reportedUid || !body.reason) {
    return NextResponse.json({ error: "Missing reportedUid or reason" }, { status: 400 });
  }

  const validReasons = ["fake_profile", "inappropriate_photo", "harassment", "spam", "misleading_info", "other"];
  if (!validReasons.includes(body.reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const description = body.description ? sanitizeInput(body.description, 1000) : "";
  const reportId = await reportUser(user.uid, body.reportedUid, body.reason as never, description);
  if (!reportId) return NextResponse.json({ error: "Failed to create report" }, { status: 500 });

  return NextResponse.json({ reportId, success: true });
}
