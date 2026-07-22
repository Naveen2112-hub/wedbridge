export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  path?: string;
  userAgent?: string;
}

const isProduction = process.env.NODE_ENV === "production";
const isClient = typeof window !== "undefined";
const MAX_LOG_BUFFER = 100;
const logBuffer: LogEntry[] = [];

function getLevelValue(level: LogLevel): number {
  const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
  return levels[level] ?? 1;
}

function shouldLog(level: LogLevel): boolean {
  if (isProduction) return getLevelValue(level) >= 2;
  return true;
}

function getContext(): Partial<LogEntry> {
  if (!isClient) return {};
  return {
    path: window.location.pathname,
    userAgent: navigator.userAgent.slice(0, 200),
  };
}

function formatEntry(entry: LogEntry): string {
  const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${ctx}`;
}

function addToBuffer(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();
}

export function log(level: LogLevel, message: string, context?: Record<string, unknown>, userId?: string) {
  if (!shouldLog(level)) return;
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    userId,
    ...getContext(),
  };
  addToBuffer(entry);
  const formatted = formatEntry(entry);
  if (level === "error" || level === "fatal") console.error(formatted);
  else if (level === "warn") console.warn(formatted);
  else if (isClient) console.log(formatted);
  else console.log(formatted);
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>, uid?: string) => log("debug", msg, ctx, uid),
  info: (msg: string, ctx?: Record<string, unknown>, uid?: string) => log("info", msg, ctx, uid),
  warn: (msg: string, ctx?: Record<string, unknown>, uid?: string) => log("warn", msg, ctx, uid),
  error: (msg: string, ctx?: Record<string, unknown>, uid?: string) => log("error", msg, ctx, uid),
  fatal: (msg: string, ctx?: Record<string, unknown>, uid?: string) => log("fatal", msg, ctx, uid),
};

export function getLogBuffer(): LogEntry[] {
  return [...logBuffer];
}

export function clearLogBuffer() {
  logBuffer.length = 0;
}
