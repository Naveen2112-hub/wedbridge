/**
 * Client-safe subset of telegram utilities.
 * This file does NOT import firebase/config or use server-only env vars.
 * Safe to import from "use client" components.
 */

/**
 * Escape special MarkdownV2 characters.
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}
