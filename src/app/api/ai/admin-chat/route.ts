import { NextRequest, NextResponse } from "next/server";
import { processAdminQuery } from "@/lib/ai/adminAssistant";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";
import { checkRateLimit, getClientIP } from "@/lib/security/securityService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const userDoc = await db.collection("users").doc(user.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
  }

  const ip = getClientIP(req);
  const rl = checkRateLimit(`ai-admin:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const { message } = await req.json() as { message: string };
    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "message is required (max 2000 chars)" }, { status: 400 });
    }
    const response = await processAdminQuery(message);
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Admin query failed" },
      { status: 500 },
    );
  }
}
