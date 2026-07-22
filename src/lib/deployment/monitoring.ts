/**
 * Monitoring and logging service.
 * Provides structured logging for production monitoring.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const logBuffer: LogEntry[] = [];
const MAX_LOG_BUFFER = 500;

/**
 * Log a structured entry.
 */
export function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();

  if (level === "error") console.error(`[ERROR] ${message}`, context ?? "");
  else if (level === "warn") console.warn(`[WARN] ${message}`, context ?? "");
  else if (process.env.NODE_ENV !== "production" && level === "debug") console.debug(`[DEBUG] ${message}`, context ?? "");
  else if (level === "info") console.log(`[INFO] ${message}`);
}

/**
 * Get recent logs for monitoring dashboard.
 */
export function getRecentLogs(limit = 100): LogEntry[] {
  return logBuffer.slice(-limit).reverse();
}

/**
 * Get error count.
 */
export function getErrorCount(): number {
  return logBuffer.filter((l) => l.level === "error").length;
}

/**
 * Get health status.
 */
export function getHealthStatus(): { healthy: boolean; uptime: number; errors: number; warnings: number } {
  return {
    healthy: getErrorCount() < 10,
    uptime: process.uptime(),
    errors: logBuffer.filter((l) => l.level === "error").length,
    warnings: logBuffer.filter((l) => l.level === "warn").length,
  };
}
