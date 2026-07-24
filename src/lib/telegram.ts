/**
 * Telegram Bot API integration for WedBridge.
 * Server-side only. Never expose bot tokens to the client.
 */
import { getDb } from "@/lib/firebase-admin";
import { collections, type AppUser } from "@/firebase/schema";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface TelegramInlineButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface TelegramLogEntry {
  userId: string;
  chatId: string;
  messageType: string;
  status: "success" | "failed";
  error?: string;
  createdAt?: unknown;
}

export interface BroadcastTarget {
  type: "all" | "premium" | "verified" | "specific";
  userIds?: string[];
}

export interface BroadcastResult {
  total: number;
  success: number;
  failed: number;
  failedUserIds: string[];
}

/**
 * Escape special MarkdownV2 characters.
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

/**
 * Get the bot token from environment variables (server-side only).
 */
function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN ?? null;
}

/**
 * Make a Telegram Bot API request with retry logic.
 */
async function telegramRequest<T = unknown>(
  token: string,
  method: string,
  body: Record<string, unknown>,
  attempt = 1
): Promise<{ ok: boolean; result?: T; error?: string }> {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description ?? "Telegram API error");
    return { ok: true, result: data.result as T };
  } catch (e) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      return telegramRequest<T>(token, method, body, attempt + 1);
    }
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Send a text message via Telegram. Uses MarkdownV2 parse mode.
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  inlineButtons?: TelegramInlineButton[][]
): Promise<{ ok: boolean; error?: string }> {
  const token = getBotToken();
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured." };
  if (!chatId) return { ok: false, error: "Chat ID is required." };

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "MarkdownV2",
  };
  if (inlineButtons && inlineButtons.length > 0) {
    body.reply_markup = JSON.stringify({ inline_keyboard: inlineButtons });
  }

  return telegramRequest(token, "sendMessage", body);
}

/**
 * Send a photo via Telegram.
 */
export async function sendPhoto(
  chatId: string,
  photoUrl: string,
  caption?: string,
  inlineButtons?: TelegramInlineButton[][]
): Promise<{ ok: boolean; error?: string }> {
  const token = getBotToken();
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured." };
  if (!chatId) return { ok: false, error: "Chat ID is required." };

  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
  };
  if (caption) {
    body.caption = caption;
    body.parse_mode = "MarkdownV2";
  }
  if (inlineButtons && inlineButtons.length > 0) {
    body.reply_markup = JSON.stringify({ inline_keyboard: inlineButtons });
  }

  return telegramRequest(token, "sendPhoto", body);
}

/**
 * Send a document (e.g. PDF) via Telegram.
 */
export async function sendDocument(
  chatId: string,
  documentUrl: string,
  caption?: string,
  inlineButtons?: TelegramInlineButton[][]
): Promise<{ ok: boolean; error?: string }> {
  const token = getBotToken();
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured." };
  if (!chatId) return { ok: false, error: "Chat ID is required." };

  const body: Record<string, unknown> = {
    chat_id: chatId,
    document: documentUrl,
  };
  if (caption) {
    body.caption = caption;
    body.parse_mode = "MarkdownV2";
  }
  if (inlineButtons && inlineButtons.length > 0) {
    body.reply_markup = JSON.stringify({ inline_keyboard: inlineButtons });
  }

  return telegramRequest(token, "sendDocument", body);
}

/**
 * Validate a bot token by calling getMe.
 */
export async function validateBotToken(token: string): Promise<{ ok: boolean; botName?: string; error?: string }> {
  if (!token) return { ok: false, error: "Bot token is required." };
  const res = await telegramRequest<{ username: string }>(token, "getMe", {});
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, botName: res.result?.username };
}

/**
 * Validate a chat ID by sending a test message.
 */
export async function validateChatId(token: string, chatId: string): Promise<{ ok: boolean; error?: string }> {
  if (!chatId) return { ok: false, error: "Chat ID is required." };
  const res = await sendTelegramMessageWithToken(token, chatId, "✅ WedBridge connection test successful");
  return res;
}

async function sendTelegramMessageWithToken(
  token: string,
  chatId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  return telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "MarkdownV2",
  });
}

/**
 * Get Telegram settings for a user from Firestore.
 */
export async function getTelegramSettings(userId: string): Promise<TelegramSettings | null> {
  try {
    const db = getDb();
    const snap = await db.collection(collections.telegramSettings).doc(userId).get();
    if (!snap.exists) return null;
    return snap.data() as TelegramSettings;
  } catch {
    return null;
  }
}

/**
 * Save Telegram settings to Firestore.
 */
export async function saveTelegramSettings(userId: string, settings: TelegramSettings): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = getDb();
    await db.collection(collections.telegramSettings).doc(userId).set({
      userId,
      botToken: settings.botToken,
      chatId: settings.chatId,
      enabled: settings.enabled,
      updatedAt: new Date(),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save settings." };
  }
}

/**
 * Log a Telegram notification to Firestore.
 */
export async function logTelegramNotification(entry: TelegramLogEntry): Promise<void> {
  try {
    const db = getDb();
    await db.collection(collections.telegramLogs).add({
      ...entry,
      createdAt: new Date(),
    });
  } catch {
    // logging is best-effort
  }
}

/**
 * Add a failed notification to the retry queue.
 */
export async function enqueueRetry(
  userId: string,
  chatId: string,
  messageType: string,
  payload: Record<string, unknown>,
  error: string
): Promise<void> {
  try {
    const db = getDb();
    await db.collection(collections.telegramQueue).add({
      userId,
      chatId,
      messageType,
      payload,
      error,
      attempts: 0,
      maxAttempts: MAX_RETRIES,
      status: "pending",
      createdAt: new Date(),
      nextRetryAt: new Date(),
    });
  } catch {
    // best-effort
  }
}

/**
 * Send a notification to a specific user, reading their settings from Firestore.
 */
export async function sendUserNotification(
  userId: string,
  messageType: string,
  text: string,
  inlineButtons?: TelegramInlineButton[][]
): Promise<{ ok: boolean; error?: string }> {
  const settings = await getTelegramSettings(userId);
  if (!settings || !settings.enabled || !settings.chatId) {
    return { ok: false, error: "Telegram not configured for this user." };
  }

  const result = await sendTelegramMessage(settings.chatId, text, inlineButtons);

  await logTelegramNotification({
    userId,
    chatId: settings.chatId,
    messageType,
    status: result.ok ? "success" : "failed",
    error: result.error,
  });

  if (!result.ok) {
    await enqueueRetry(userId, settings.chatId, messageType, { text }, result.error ?? "Unknown error");
  }

  return result;
}

/**
 * Broadcast a message to multiple users based on target criteria.
 */
export async function broadcastMessage(
  target: BroadcastTarget,
  text: string,
  inlineButtons?: TelegramInlineButton[][]
): Promise<BroadcastResult> {
  const database = getDb();

  let userIds: string[] = [];

  if (target.type === "specific" && target.userIds) {
    userIds = target.userIds;
  } else {
    const snap = await database.collection(collections.telegramSettings).where("enabled", "==", true).get();
    const settingsList = snap.docs.map((d) => ({ id: d.id, ...(d.data() as TelegramSettings) }));

    if (target.type === "all") {
      userIds = settingsList.map((s) => s.id);
    } else if (target.type === "premium") {
      const userSnaps = await Promise.all(
        settingsList.map((s) => database.collection(collections.users).doc(s.id).get())
      );
      userIds = settingsList
        .filter((_, i) => {
          const u = userSnaps[i].data() as AppUser | undefined;
          return u && (u.membershipTier === "premium" || u.membershipTier === "gold" || u.membershipTier === "elite");
        })
        .map((s) => s.id);
    } else if (target.type === "verified") {
      const userSnaps = await Promise.all(
        settingsList.map((s) => database.collection(collections.users).doc(s.id).get())
      );
      userIds = settingsList
        .filter((_, i) => {
          const u = userSnaps[i].data() as AppUser | undefined;
          return u && u.verified === true;
        })
        .map((s) => s.id);
    }
  }

  let success = 0;
  let failed = 0;
  const failedUserIds: string[] = [];

  for (const uid of userIds) {
    const res = await sendUserNotification(uid, "broadcast", text, inlineButtons);
    if (res.ok) success++;
    else { failed++; failedUserIds.push(uid); }
  }

  // Log broadcast
  try {
    await database.collection(collections.broadcasts).add({
      target: target.type,
      text,
      total: userIds.length,
      success,
      failed,
      failedUserIds,
      createdAt: new Date(),
    });
  } catch {
    // best-effort
  }

  return { total: userIds.length, success, failed, failedUserIds };
}

/**
 * Get the bot's username from the environment token.
 */
export async function getBotInfo(): Promise<{ ok: boolean; username?: string; error?: string }> {
  const token = getBotToken();
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured." };
  const res = await telegramRequest<{ username: string }>(token, "getMe", {});
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, username: res.result?.username };
}

/**
 * Get updates from the bot (long polling) to find chat ID for a user.
 */
export async function getBotUpdates(): Promise<{ ok: boolean; updates?: unknown[]; error?: string }> {
  const token = getBotToken();
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured." };
  const res = await telegramRequest<unknown[]>(token, "getUpdates", { limit: 10, timeout: 0 });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, updates: res.result ?? [] };
}

/**
 * Set up bot commands for the Telegram bot.
 */
export async function setBotCommands(): Promise<{ ok: boolean; error?: string }> {
  const token = getBotToken();
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured." };

  const commands = [
    { command: "start", description: "Start using WedBridge Bot" },
    { command: "help", description: "Get help and available commands" },
    { command: "profile", description: "View your profile" },
    { command: "membership", description: "View your membership plan" },
    { command: "interests", description: "View your interests" },
    { command: "matches", description: "View your AI matches" },
    { command: "settings", description: "Manage your settings" },
    { command: "contact", description: "Contact support" },
  ];

  return telegramRequest(token, "setMyCommands", { commands });
}

/**
 * Get recent broadcasts from Firestore.
 */
export async function getRecentBroadcasts(limitCount = 20): Promise<unknown[]> {
  try {
    const database = getDb();
    const snap = await database.collection(collections.broadcasts).orderBy("createdAt", "desc").limit(limitCount).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}
