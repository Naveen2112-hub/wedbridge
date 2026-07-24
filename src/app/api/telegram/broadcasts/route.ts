import { NextResponse } from "next/server";
import { getRecentBroadcasts } from "@/lib/telegram";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const userDoc = await db.collection("users").doc(user.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
  }

  try {
    const broadcasts = await getRecentBroadcasts(20);
    return NextResponse.json({ broadcasts });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
