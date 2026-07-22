import { NextRequest, NextResponse } from "next/server";
import { processChatQuery } from "@/lib/ai/chatAssistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message, uid, profile } = await req.json() as { message: string; uid: string; profile?: unknown };
    if (!message || !uid) {
      return NextResponse.json({ error: "message and uid are required" }, { status: 400 });
    }
    const response = await processChatQuery(message, { uid, profile: profile as never });
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chat failed" },
      { status: 500 },
    );
  }
}
