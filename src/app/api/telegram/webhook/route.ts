import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { collections } from "@/firebase/schema";
import { processBiodataImport } from "@/lib/ocr/biodataImport";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Telegram webhook handler.
 * Handles: document, photo, image uploads + /start, /help commands.
 * Ignores all other text messages.
 * Set webhook to: https://yourdomain.com/api/telegram/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
      const provided = req.headers.get("x-telegram-bot-api-secret-token");
      if (provided !== secret) return NextResponse.json({ ok: true });
    }

    const update = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return NextResponse.json({ ok: true });

    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = String(message.chat.id);
    const fromUser = message.from;
    const telegramUserId = fromUser?.id;

    // Handle text commands
    if (message.text) {
      const text = message.text as string;
      if (text.startsWith("/start")) {
        const name = fromUser?.first_name ? ` ${fromUser.first_name}` : "";
        await sendText(token, chatId, [
          `🎉 Welcome${name} to WedBridge Bot!`,
          "",
          "Your Chat ID is: " + chatId,
          "",
          "📸 Send me a Matrimony Biodata PDF or Image and I'll extract the details for you.",
          "",
          "Supported formats: PDF, JPG, PNG",
        ].join("\n"));
      } else if (text.startsWith("/help")) {
        await sendText(token, chatId, [
          "📖 WedBridge Bot Help",
          "",
          "How to use:",
          "1. Send a Matrimony Biodata as a PDF or photo",
          "2. I'll extract the details automatically",
          "3. You'll get a link to complete your profile",
          "",
          "Commands:",
          "/start - Get started",
          "/help - Show this help",
        ].join("\n"));
      }
      // Ignore all other text messages
      return NextResponse.json({ ok: true });
    }

    // Handle document uploads (PDF, images sent as files)
    if (message.document) {
      const doc = message.document;
      const fileId = doc.file_id as string;
      const fileName = (doc.file_name ?? "document").toLowerCase();
      const mime = doc.mime_type ?? "";

      const isSupported =
        mime === "application/pdf" ||
        mime.startsWith("image/") ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg") ||
        fileName.endsWith(".png");

      if (!isSupported) {
        await sendText(token, chatId, "❌ Unsupported file type. Please send a PDF, JPG, or PNG file.");
        return NextResponse.json({ ok: true });
      }

      await sendText(token, chatId, "📥 Received your biodata. Processing... This may take a moment.");

      // Process asynchronously
      processBiodataImport(token, chatId, fileId, telegramUserId)
        .then(async (result) => {
          if (!result.success && result.status === "failed_ocr") {
            await sendText(token, chatId, "❌ Sorry, I couldn't process the file. Please ensure it's a clear biodata PDF or image.");
          }
        })
        .catch(async () => {
          await sendText(token, chatId, "❌ Processing failed. Please try again with a clearer file.");
        });

      return NextResponse.json({ ok: true });
    }

    // Handle photo uploads (images sent as photos)
    if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
      // Get the largest photo size
      const largest = message.photo[message.photo.length - 1];
      const fileId = largest.file_id as string;

      await sendText(token, chatId, "📥 Received your biodata photo. Processing... This may take a moment.");

      processBiodataImport(token, chatId, fileId, telegramUserId)
        .then(async (result) => {
          if (!result.success && result.status === "failed_ocr") {
            await sendText(token, chatId, "❌ Sorry, I couldn't process the photo. Please ensure it's a clear biodata image.");
          }
        })
        .catch(async () => {
          await sendText(token, chatId, "❌ Processing failed. Please try again with a clearer photo.");
        });

      return NextResponse.json({ ok: true });
    }

    // Log unhandled message types
    try {
      const database = getDb();
      await database.collection(collections.telegramLogs).add({
        userId: "bot",
        chatId,
        messageType: "unhandled",
        status: "success",
        createdAt: new Date(),
      });
    } catch {
      // best-effort
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

async function sendText(token: string, chatId: string, text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {
    // best-effort
  }
}
