import { NextRequest, NextResponse } from "next/server";
import { broadcastMessage, type BroadcastTarget } from "@/lib/telegram";
import { escapeMarkdown } from "@/lib/telegram-client";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

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

  try {
    const { message, target, mediaType, mediaUrl } = (await req.json()) as {
      message: string;
      target: BroadcastTarget;
      mediaType?: "photo" | "document";
      mediaUrl?: string;
    };

    if (!message && !mediaUrl) {
      return NextResponse.json({ error: "Message or media is required." }, { status: 400 });
    }

    const text = escapeMarkdown(message);
    const result = await broadcastMessage(target, text);

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
