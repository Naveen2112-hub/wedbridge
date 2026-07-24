import { NextRequest, NextResponse } from "next/server";
import { getBotUpdates, getBotInfo, setBotCommands } from "@/lib/telegram";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

async function verifyAdmin(req: Request): Promise<NextResponse | null> {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const userDoc = await db.collection("users").doc(user.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const botInfo = await getBotInfo();
    if (!botInfo.ok) {
      return NextResponse.json({ error: botInfo.error }, { status: 400 });
    }

    const updatesRes = await getBotUpdates();
    const updates = updatesRes.updates ?? [];

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

export async function POST(req: NextRequest) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

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
