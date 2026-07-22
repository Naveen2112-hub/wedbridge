import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { collections } from "@/firebase/schema";

export const runtime = "nodejs";

/**
 * Telegram webhook handler for bot commands.
 * Set webhook to: https://yourdomain.com/api/telegram/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text as string;
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ ok: true });
    }

    let responseText = "";

    if (text.startsWith("/start")) {
      responseText = "🎉 Welcome to WedBridge Bot! Your Chat ID is: " + chatId + ". Enter this in your WedBridge settings to connect.";
    } else if (text.startsWith("/help")) {
      responseText = "Available commands:\n/start - Get started\n/help - Show this help\n/profile - View your profile\n/membership - View membership\n/interests - View interests\n/matches - View matches\n/settings - Manage settings\n/contact - Contact support";
    } else if (text.startsWith("/profile")) {
      responseText = "View your profile at https://wedbridge.app/profile";
    } else if (text.startsWith("/membership")) {
      responseText = "View your membership at https://wedbridge.app/membership";
    } else if (text.startsWith("/interests")) {
      responseText = "View your interests at https://wedbridge.app/interests";
    } else if (text.startsWith("/matches")) {
      responseText = "View your AI matches at https://wedbridge.app/ai-matches";
    } else if (text.startsWith("/settings")) {
      responseText = "Manage settings at https://wedbridge.app/settings";
    } else if (text.startsWith("/contact")) {
      responseText = "Contact support: support@wedbridge.app";
    } else {
      responseText = "Unknown command. Type /help to see available commands.";
    }

    // Send response
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: responseText }),
    });

    // Log the webhook event
    if (db) {
      try {
        await addDoc(collection(db, collections.telegramLogs), {
          userId: "bot",
          chatId,
          messageType: "command",
          status: "success",
          command: text,
          createdAt: serverTimestamp(),
        });
      } catch {
        // best-effort
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
