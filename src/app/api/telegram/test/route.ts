import { NextRequest, NextResponse } from "next/server";
import { getTelegramSettings, sendTelegramMessage, logTelegramNotification } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const settings = await getTelegramSettings(userId);
    if (!settings || !settings.chatId) {
      return NextResponse.json({ error: "Telegram not configured. Add your Chat ID first." }, { status: 400 });
    }

    const result = await sendTelegramMessage(settings.chatId, "✅ Telegram Integration Successful");

    await logTelegramNotification({
      userId,
      chatId: settings.chatId,
      messageType: "test",
      status: result.ok ? "success" : "failed",
      error: result.error,
    });

    return NextResponse.json({ ok: result.ok, error: result.error });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
