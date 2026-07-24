import { NextRequest, NextResponse } from "next/server";
import { getTelegramSettings } from "@/lib/telegram";
import { getAuthUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const settings = await getTelegramSettings(user.uid);
    return NextResponse.json({
      configured: !!settings,
      chatId: settings?.chatId ?? "",
      enabled: settings?.enabled ?? false,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
