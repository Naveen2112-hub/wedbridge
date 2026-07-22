import { NextRequest, NextResponse } from "next/server";
import { getBotUpdates, getBotInfo, setBotCommands } from "@/lib/telegram";

export const runtime = "nodejs";

/**
 * GET: Get bot info and recent updates (for Connect Telegram flow)
 */
export async function GET() {
  try {
    const botInfo = await getBotInfo();
    if (!botInfo.ok) {
      return NextResponse.json({ error: botInfo.error }, { status: 400 });
    }

    const updatesRes = await getBotUpdates();
    const updates = updatesRes.updates ?? [];

    // Extract chat IDs from recent messages
    const chatIds = new Map<string, { chatId: string; username?: string; firstName?: string }>();
    for (const update of updates as Array<{ message?: { chat?: { id: number; username?: string; first_name?: string }; text?: string } }>) {
      const chat = update.message?.chat;
      if (chat) {
        chatIds.set(String(chat.id), {
          chatId: String(chat.id),
          username: chat.username,
          firstName: chat.first_name,
        });
      }
    }

    return NextResponse.json({
      botUsername: botInfo.username,
      chatIds: Array.from(chatIds.values()),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}

/**
 * POST: Set up bot commands
 */
export async function POST() {
  try {
    const result = await setBotCommands();
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
