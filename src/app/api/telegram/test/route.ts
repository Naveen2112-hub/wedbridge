import { NextRequest, NextResponse } from "next/server";
import { getTelegramSettings, sendTelegramMessage, logTelegramNotification } from "@/lib/telegram";
import { getAuthUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const settings = await getTelegramSettings(user.uid);
    if (!settings || !settings.chatId) {
      return NextResponse.json({ error: "Telegram not configured. Add your Chat ID first." }, { status: 400 });
    }

    const result = await sendTelegramMessage(settings.chatId, "✅ Telegram Integration Successful");

    await logTelegramNotification({
      userId: user.uid,
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
