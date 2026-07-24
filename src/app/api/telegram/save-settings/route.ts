import { NextRequest, NextResponse } from "next/server";
import { validateBotToken, validateChatId, saveTelegramSettings } from "@/lib/telegram";
import { getAuthUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { botToken, chatId, enabled } = (await req.json()) as {
      botToken: string;
      chatId: string;
      enabled: boolean;
    };

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Bot Token and Chat ID are required." }, { status: 400 });
    }

    const tokenCheck = await validateBotToken(botToken);
    if (!tokenCheck.ok) {
      return NextResponse.json({ error: tokenCheck.error ?? "Invalid bot token." }, { status: 400 });
    }

    const chatCheck = await validateChatId(botToken, chatId);
    if (!chatCheck.ok) {
      return NextResponse.json({ error: chatCheck.error ?? "Invalid chat ID. Make sure you've started the bot first." }, { status: 400 });
    }

    const saveResult = await saveTelegramSettings(user.uid, { botToken, chatId, enabled });
    if (!saveResult.ok) {
      return NextResponse.json({ error: saveResult.error ?? "Failed to save settings." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, botName: tokenCheck.botName });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
