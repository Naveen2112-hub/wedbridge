import { NextRequest, NextResponse } from "next/server";
import { broadcastMessage, type BroadcastTarget } from "@/lib/telegram";
import { escapeMarkdown } from "@/lib/telegram-client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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
