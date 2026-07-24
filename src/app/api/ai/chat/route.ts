import { NextRequest, NextResponse } from "next/server";
import { processChatQuery } from "@/lib/ai/chatAssistant";
import { getAuthUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIP } from "@/lib/security/securityService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIP(req);
  const rl = checkRateLimit(`ai-chat:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 20 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  try {
    const { message, profile } = await req.json() as { message: string; uid?: string; profile?: unknown };
    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "message is required (max 2000 chars)" }, { status: 400 });
    }
    const response = await processChatQuery(message, { uid: user.uid, profile: profile as never });
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chat failed" },
      { status: 500 },
    );
  }
}
