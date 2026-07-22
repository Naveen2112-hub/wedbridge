import { logger } from "./logger";

export interface FirebaseErrorEvent {
  code: string;
  message: string;
  operation: string;
  collection?: string;
  timestamp: string;
  userId?: string;
}

const errorBuffer: FirebaseErrorEvent[] = [];
const MAX_EVENTS = 50;
const errorCounts = new Map<string, number>();

function classifyErrorCode(code: string): "network" | "permission" | "quota" | "not-found" | "validation" | "unknown" {
  if (code.includes("network") || code.includes("unreachable")) return "network";
  if (code.includes("permission-denied") || code.includes("unauthorized")) return "permission";
  if (code.includes("quota") || code.includes("resource-exhausted")) return "quota";
  if (code.includes("not-found") || code.includes("no-such-document")) return "not-found";
  if (code.includes("invalid") || code.includes("argument")) return "validation";
  return "unknown";
}

export function trackFirebaseError(error: unknown, operation: string, collection?: string, userId?: string): FirebaseErrorEvent {
  const code = (error as { code?: string })?.code ?? "unknown";
  const message = error instanceof Error ? error.message : String(error);
  const event: FirebaseErrorEvent = { code, message, operation, collection, timestamp: new Date().toISOString(), userId };
  errorBuffer.push(event);
  if (errorBuffer.length > MAX_EVENTS) errorBuffer.shift();
  const key = `${operation}:${code}`;
  errorCounts.set(key, (errorCounts.get(key) ?? 0) + 1);
  const category = classifyErrorCode(code);
  logger.error(`Firebase ${category} error in ${operation}`, { code, message, collection }, userId);
  return event;
}

export function getErrorSummary(): { total: number; byCategory: Record<string, number>; topErrors: { key: string; count: number }[] } {
  const byCategory: Record<string, number> = {};
  for (const event of errorBuffer) { const cat = classifyErrorCode(event.code); byCategory[cat] = (byCategory[cat] ?? 0) + 1; }
  const topErrors = Array.from(errorCounts.entries()).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  return { total: errorBuffer.length, byCategory, topErrors };
}

export function getRecentErrors(): FirebaseErrorEvent[] { return [...errorBuffer].reverse(); }
export function clearErrorBuffer() { errorBuffer.length = 0; errorCounts.clear(); }

export function isRetryableError(code: string): boolean {
  const category = classifyErrorCode(code);
  return category === "network" || category === "quota";
}

export async function withFirebaseRetry<T>(fn: () => Promise<T>, operation: string, retries = 2, collection?: string, userId?: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await fn(); } catch (error) {
      lastError = error;
      const code = (error as { code?: string })?.code ?? "unknown";
      if (attempt < retries && isRetryableError(code)) {
        logger.warn(`Retrying ${operation} (attempt ${attempt + 1}/${retries})`, { code });
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      trackFirebaseError(error, operation, collection, userId);
      throw error;
    }
  }
  throw lastError;
}
