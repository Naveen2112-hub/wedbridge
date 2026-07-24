import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { blockUser, unblockUser, getBlockedUsers } from "@/lib/user/blockService";
import { checkRateLimit, getClientIP, sanitizeInput } from "@/lib/security/securityService";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blocked = await getBlockedUsers(user.uid);
  return NextResponse.json({ blocked });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIP(req);
  const rl = checkRateLimit(`block:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await req.json() as { blockedUid: string; reason?: string };
  if (!body.blockedUid) return NextResponse.json({ error: "Missing blockedUid" }, { status: 400 });

  const reason = body.reason ? sanitizeInput(body.reason, 500) : undefined;
  const ok = await blockUser(user.uid, body.blockedUid, reason);
  return NextResponse.json({ success: ok });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { blockedUid: string };
  if (!body.blockedUid) return NextResponse.json({ error: "Missing blockedUid" }, { status: 400 });

  const ok = await unblockUser(user.uid, body.blockedUid);
  return NextResponse.json({ success: ok });
}
