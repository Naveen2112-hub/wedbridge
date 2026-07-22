import { NextResponse } from "next/server";
import { getRecentBroadcasts } from "@/lib/telegram";

export const runtime = "nodejs";

export async function GET() {
  try {
    const broadcasts = await getRecentBroadcasts(20);
    return NextResponse.json({ broadcasts });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
