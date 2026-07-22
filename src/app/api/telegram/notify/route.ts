import { NextRequest, NextResponse } from "next/server";
import { getTelegramSettings, sendTelegramMessage, logTelegramNotification, enqueueRetry, type TelegramInlineButton } from "@/lib/telegram";
import { buildNotificationText, getInlineButtons, type NotificationType } from "@/lib/telegram-notifications";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { type, extra } = (await req.json()) as { type: NotificationType; extra?: Record<string, string> };

    // Get the authenticated user's ID from the request header set by client middleware
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const settings = await getTelegramSettings(userId);
    if (!settings || !settings.enabled || !settings.chatId) {
      return NextResponse.json({ error: "Telegram not configured." }, { status: 400 });
    }

    const text = buildNotificationText(type, extra);
    const buttons = getInlineButtons(type) as TelegramInlineButton[][] | undefined;

    const result = await sendTelegramMessage(settings.chatId, text, buttons);

    await logTelegramNotification({
      userId,
      chatId: settings.chatId,
      messageType: type,
      status: result.ok ? "success" : "failed",
      error: result.error,
    });

    if (!result.ok) {
      await enqueueRetry(userId, settings.chatId, type, { text }, result.error ?? "Unknown error");
    }

    return NextResponse.json({ ok: result.ok, error: result.error });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
