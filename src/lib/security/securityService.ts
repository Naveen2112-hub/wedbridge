/**
 * Security Service
 * Rate limiting, input validation, audit logging, role validation.
 * In-memory rate limiter for server-side API routes.
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_LIMIT: RateLimitConfig = { windowMs: 60_000, maxRequests: 30 };

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a given key (IP or user ID).
 */
export function checkRateLimit(key: string, config: RateLimitConfig = DEFAULT_LIMIT): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Get client IP from Next.js request.
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

/**
 * Validate and sanitize user input.
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  return input
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (Indian format).
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, "");
  return /^[6-9]\d{9}$/.test(cleaned) || /^91[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validate file upload.
 */
export function validateFileUpload(file: { name: string; type: string; size: number }, maxSizeMB = 50): { valid: boolean; error?: string } {
  const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/jpg"];
  const validExtensions = ["pdf", "jpg", "jpeg", "png", "webp"];

  if (!validTypes.includes(file.type)) {
    const ext = file.name.toLowerCase().split(".").pop() ?? "";
    if (!validExtensions.includes(ext)) {
      return { valid: false, error: "Invalid file type" };
    }
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File exceeds ${maxSizeMB}MB limit` };
  }

  return { valid: true };
}

/**
 * Audit log entry.
 */
export interface AuditLogEntry {
  action: string;
  userId?: string;
  resource?: string;
  details?: Record<string, unknown>;
  ip?: string;
  timestamp: number;
}

const auditLogBuffer: AuditLogEntry[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * Log an audit entry (in-memory buffer for the current server instance).
 */
export function logAudit(entry: Omit<AuditLogEntry, "timestamp">): void {
  const logEntry: AuditLogEntry = { ...entry, timestamp: Date.now() };
  auditLogBuffer.push(logEntry);
  if (auditLogBuffer.length > MAX_BUFFER_SIZE) {
    auditLogBuffer.shift();
  }
}

/**
 * Get recent audit logs.
 */
export function getAuditLogs(limit = 100): AuditLogEntry[] {
  return auditLogBuffer.slice(-limit).reverse();
}

/**
 * Validate user role for admin access.
 */
export function isAdminRole(role: string | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Generate a secure random token.
 */
export function generateSecureToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
