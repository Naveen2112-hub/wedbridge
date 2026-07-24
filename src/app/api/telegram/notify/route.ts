import { NextRequest, NextResponse } from "next/server";
import { getTelegramSettings, sendTelegramMessage, logTelegramNotification, enqueueRetry, type TelegramInlineButton } from "@/lib/telegram";
import { buildNotificationText, getInlineButtons, type NotificationType } from "@/lib/telegram-notifications";
import { getAuthUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { type, extra } = (await req.json()) as { type: NotificationType; extra?: Record<string, string> };

    const settings = await getTelegramSettings(user.uid);
    if (!settings || !settings.enabled || !settings.chatId) {
      return NextResponse.json({ error: "Telegram not configured." }, { status: 400 });
    }

    const text = buildNotificationText(type, extra);
    const buttons = getInlineButtons(type) as TelegramInlineButton[][] | undefined;

    const result = await sendTelegramMessage(settings.chatId, text, buttons);

    await logTelegramNotification({
      userId: user.uid,
      chatId: settings.chatId,
      messageType: type,
      status: result.ok ? "success" : "failed",
      error: result.error,
    });

    if (!result.ok) {
      await enqueueRetry(user.uid, settings.chatId, type, { text }, result.error ?? "Unknown error");
    }

    return NextResponse.json({ ok: result.ok, error: result.error });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
