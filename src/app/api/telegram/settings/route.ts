import { NextRequest, NextResponse } from "next/server";
import { getTelegramSettings } from "@/lib/telegram";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const settings = await getTelegramSettings(userId);
    // Never return the bot token to the client
    return NextResponse.json({
      configured: !!settings,
      chatId: settings?.chatId ?? "",
      enabled: settings?.enabled ?? false,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
