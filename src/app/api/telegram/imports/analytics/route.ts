import { NextResponse } from "next/server";
import { getOcrAnalytics } from "@/lib/ocr/analytics";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const analytics = await getOcrAnalytics();
    return NextResponse.json(analytics);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
