import { NextRequest, NextResponse } from "next/server";
import { validateBotToken, validateChatId, saveTelegramSettings } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { botToken, chatId, enabled } = (await req.json()) as {
      botToken: string;
      chatId: string;
      enabled: boolean;
    };

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Bot Token and Chat ID are required." }, { status: 400 });
    }

    // Validate bot token
    const tokenCheck = await validateBotToken(botToken);
    if (!tokenCheck.ok) {
      return NextResponse.json({ error: tokenCheck.error ?? "Invalid bot token." }, { status: 400 });
    }

    // Validate chat ID by sending a test message
    const chatCheck = await validateChatId(botToken, chatId);
    if (!chatCheck.ok) {
      return NextResponse.json({ error: chatCheck.error ?? "Invalid chat ID. Make sure you've started the bot first." }, { status: 400 });
    }

    // Save settings
    const saveResult = await saveTelegramSettings(userId, { botToken, chatId, enabled });
    if (!saveResult.ok) {
      return NextResponse.json({ error: saveResult.error ?? "Failed to save settings." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, botName: tokenCheck.botName });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
