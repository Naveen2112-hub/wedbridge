/**
 * Client-side Telegram notification helper.
 * Calls API routes to send notifications securely (bot token stays server-side).
 */
import { escapeMarkdown } from "@/lib/telegram-client";

export type NotificationType =
  | "welcome"
  | "login"
  | "interest_received"
  | "interest_accepted"
  | "match_found"
  | "new_message"
  | "membership_purchased"
  | "vendor_booking"
  | "payment_success"
  | "ocr_completed"
  | "admin_broadcast"
  | "password_reset"
  | "profile_verification";

interface NotifyResult { ok: boolean; error?: string }

/**
 * Send a Telegram notification to the current authenticated user.
 */
export async function sendNotification(
  type: NotificationType,
  extra?: Record<string, string>
): Promise<NotifyResult> {
  try {
    const res = await fetch("/api/telegram/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, extra }),
    });
    const data = await res.json();
    return { ok: res.ok, error: data.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * Build notification text for each event type using MarkdownV2.
 */
export function buildNotificationText(
  type: NotificationType,
  extra?: Record<string, string>
): string {
  const esc = escapeMarkdown;
  switch (type) {
    case "welcome":
      return `🎉 ${esc("Welcome to WedBridge!")} ${esc("Your matrimony journey starts now.")}`;
    case "login":
      return `🔐 ${esc("New login detected on your WedBridge account.")}`;
    case "interest_received":
      return `❤️ ${esc("Someone sent you an interest!")} ${esc("View it at https://wedbridge.app/interests")}`;
    case "interest_accepted":
      return `💍 ${esc("Your interest was accepted!")} ${esc("Start chatting on WedBridge.")}`;
    case "match_found":
      return `💕 ${esc("AI found a new compatible match for you!")} ${esc("View at https://wedbridge.app/ai-matches")}`;
    case "new_message":
      return `💬 ${esc("You have a new message on WedBridge.")}`;
    case "membership_purchased":
      return `⭐ ${esc("Premium Membership Activated!")} ${esc("Enjoy exclusive features on WedBridge.")}`;
    case "vendor_booking":
      return `📅 ${esc("Vendor Booking Confirmed!")} ${esc(extra?.vendorName ? "Vendor: " + extra.vendorName : "Your booking is confirmed.")}`;
    case "payment_success":
      return `💳 ${esc("Payment Successful!")} ${esc("Thank you for your purchase on WedBridge.")}`;
    case "ocr_completed":
      return `📄 ${esc("Biodata processed successfully!")} ${esc("Your profile has been updated.")}`;
    case "admin_broadcast":
      return `📢 ${esc(extra?.message ?? "Broadcast message from WedBridge.")}`;
    case "password_reset":
      return `🔑 ${esc("Password reset requested for your WedBridge account.")} ${esc("If this wasn't you, contact support immediately.")}`;
    case "profile_verification":
      return `✅ ${esc("Your profile has been verified!")} ${esc("You now have a verified badge on WedBridge.")}`;
    default:
      return esc("WedBridge notification");
  }
}

/**
 * Inline keyboard buttons for rich messages.
 */
export function getInlineButtons(type: NotificationType): { text: string; url: string }[][] | undefined {
  switch (type) {
    case "interest_received":
      return [[{ text: "❤️ View Interest", url: "https://wedbridge.app/interests" }]];
    case "interest_accepted":
      return [[{ text: "💍 View Match", url: "https://wedbridge.app/matches" }]];
    case "match_found":
      return [[{ text: "💕 View Match", url: "https://wedbridge.app/ai-matches" }]];
    case "membership_purchased":
      return [[{ text: "⭐ View Membership", url: "https://wedbridge.app/membership" }]];
    case "vendor_booking":
      return [[{ text: "📅 View Booking", url: "https://wedbridge.app/my-bookings" }]];
    case "payment_success":
      return [[{ text: "💳 View Receipt", url: "https://wedbridge.app/membership" }]];
    case "ocr_completed":
      return [[{ text: "📄 Open Profile", url: "https://wedbridge.app/profile" }]];
    case "profile_verification":
      return [[{ text: "📄 Open Profile", url: "https://wedbridge.app/profile" }]];
    default:
      return undefined;
  }
}
