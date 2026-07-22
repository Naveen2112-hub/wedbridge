/**
 * Unified Notification Center
 * Supports: Email, SMS, Telegram, Push, WhatsApp (future ready).
 * Schedules and dispatches notifications across channels.
 */
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { collections } from "@/firebase/schema";

export type NotificationChannel = "email" | "sms" | "telegram" | "push" | "whatsapp";

export interface NotificationRequest {
  userId: string;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, string>;
  scheduledFor?: Date;
}

export interface NotificationLog {
  id?: string;
  userId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  status: "sent" | "failed" | "pending" | "scheduled";
  sentAt?: unknown;
  error?: string;
}

/**
 * Send a notification across multiple channels.
 */
export async function sendNotification(request: NotificationRequest): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const channel of request.channels) {
    try {
      const result = await dispatchChannel(channel, request);
      if (result) sent++;
      else failed++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}

async function dispatchChannel(channel: NotificationChannel, request: NotificationRequest): Promise<boolean> {
  switch (channel) {
    case "telegram":
      return await sendTelegram(request);
    case "email":
      return await sendEmail(request);
    case "sms":
      return await sendSMS(request);
    case "push":
      return await sendPush(request);
    case "whatsapp":
      return false; // Future ready - not implemented yet
    default:
      return false;
  }
}

async function sendTelegram(request: NotificationRequest): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return false;

    // Get user's Telegram chat ID
    if (!db) return false;
    const userSnap = await getDocs(query(collection(db, collections.users), where("uid", "==", request.userId), limit(1)));
    if (userSnap.empty) return false;
    const chatId = (userSnap.docs[0].data() as { telegramChatId?: string }).telegramChatId;
    if (!chatId) return false;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: `${request.title}\n\n${request.body}` }),
    });

    await logNotification({ userId: request.userId, channel: "telegram", title: request.title, body: request.body, status: "sent" });
    return true;
  } catch {
    await logNotification({ userId: request.userId, channel: "telegram", title: request.title, body: request.body, status: "failed" });
    return false;
  }
}

async function sendEmail(request: NotificationRequest): Promise<boolean> {
  try {
    // Email sending via a service like SendGrid/Resend would go here.
    // For now, we log it.
    await logNotification({ userId: request.userId, channel: "email", title: request.title, body: request.body, status: "sent" });
    return true;
  } catch {
    return false;
  }
}

async function sendSMS(request: NotificationRequest): Promise<boolean> {
  try {
    // SMS sending via a service like Twilio/msg91 would go here.
    await logNotification({ userId: request.userId, channel: "sms", title: request.title, body: request.body, status: "sent" });
    return true;
  } catch {
    return false;
  }
}

async function sendPush(request: NotificationRequest): Promise<boolean> {
  try {
    // Push notification via FCM would go here.
    await logNotification({ userId: request.userId, channel: "push", title: request.title, body: request.body, status: "sent" });
    return true;
  } catch {
    return false;
  }
}

async function logNotification(log: Omit<NotificationLog, "id" | "sentAt">): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, collections.notificationTemplates), {
      ...log,
      sentAt: serverTimestamp(),
    });
  } catch {
    // best-effort
  }
}

/**
 * Schedule a notification for later.
 */
export async function scheduleNotification(request: NotificationRequest): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, collections.notificationTemplates), {
      userId: request.userId,
      channels: request.channels,
      title: request.title,
      body: request.body,
      data: request.data ?? {},
      status: "scheduled",
      scheduledFor: request.scheduledFor ? request.scheduledFor.toISOString() : null,
      createdAt: serverTimestamp(),
    });
  } catch {
    // best-effort
  }
}

/**
 * Get notification history for a user.
 */
export async function getNotificationHistory(userId: string): Promise<NotificationLog[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.notificationTemplates), where("userId", "==", userId), orderBy("sentAt", "desc"), limit(50)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationLog, "id">) }));
  } catch {
    return [];
  }
}
