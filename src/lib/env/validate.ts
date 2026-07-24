/**
 * Environment variable validation for WedBridge.
 *
 * Call validateEnv() once at app startup (server-side only).
 * This surfaces missing / mis-configured variables immediately
 * rather than letting them cause cryptic runtime failures later.
 */

export type EnvLevel = "required" | "optional" | "warn";

export interface EnvCheck {
  key: string;
  level: EnvLevel;
  description: string;
  /** Custom validator; return error string or null */
  validate?: (value: string) => string | null;
}

/* ── Definitions ───────────────────────────────────────────── */

const CHECKS: EnvCheck[] = [
  // Firebase client
  { key: "NEXT_PUBLIC_FIREBASE_API_KEY",         level: "required", description: "Firebase client API key" },
  { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",     level: "required", description: "Firebase auth domain" },
  { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",      level: "required", description: "Firebase project ID" },
  { key: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",  level: "required", description: "Firebase Storage bucket" },
  { key: "NEXT_PUBLIC_FIREBASE_APP_ID",          level: "required", description: "Firebase app ID" },
  { key: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", level: "optional", description: "Firebase messaging sender" },

  // Firebase Admin
  { key: "FIREBASE_PROJECT_ID",   level: "required", description: "Firebase Admin project ID" },
  { key: "FIREBASE_CLIENT_EMAIL", level: "required", description: "Firebase Admin service account email",
    validate: (v) => v.includes("@") ? null : "Must be a valid service account email (contains @)" },
  { key: "FIREBASE_PRIVATE_KEY",  level: "required", description: "Firebase Admin private key",
    validate: (v) => v.includes("BEGIN") ? null : "Looks invalid — must contain BEGIN RSA/EC PRIVATE KEY header" },

  // Razorpay
  { key: "NEXT_PUBLIC_RAZORPAY_KEY_ID", level: "warn",     description: "Razorpay public key (payments disabled without it)" },
  { key: "RAZORPAY_KEY_ID",             level: "warn",     description: "Razorpay key ID for server-side order creation",
    validate: (v) => v.startsWith("rzp_") ? null : "Should start with rzp_" },
  { key: "RAZORPAY_KEY_SECRET",         level: "warn",     description: "Razorpay secret key",
    validate: (v) => v.length >= 20 ? null : "Looks too short — check your Razorpay dashboard" },

  // Telegram
  { key: "TELEGRAM_BOT_TOKEN",      level: "warn",     description: "Telegram Bot token (notifications disabled without it)" },
  { key: "TELEGRAM_WEBHOOK_SECRET", level: "optional", description: "Webhook verification secret (recommended for production)" },

  // AI
  { key: "GEMINI_API_KEY", level: "warn", description: "Gemini AI key (OCR / AI features disabled without it)" },

  // General
  { key: "NEXT_PUBLIC_API_BASE", level: "optional", description: "Public base URL for API requests" },
];

/* ── Result types ──────────────────────────────────────────── */

export interface EnvResult {
  ok: boolean;
  missing: string[];
  warnings: string[];
  errors: string[];
}

/* ── Main validator ─────────────────────────────────────────── */

/**
 * Validate all environment variables.
 * In production (NODE_ENV=production), required-level failures throw.
 * Warnings are always printed to stderr.
 */
export function validateEnv(): EnvResult {
  const result: EnvResult = { ok: true, missing: [], warnings: [], errors: [] };

  for (const check of CHECKS) {
    const value = process.env[check.key];

    if (!value || value.trim() === "") {
      if (check.level === "required") {
        result.missing.push(`${check.key} (${check.description})`);
        result.ok = false;
      } else if (check.level === "warn") {
        result.warnings.push(`${check.key} — ${check.description}`);
      }
      continue;
    }

    if (check.validate) {
      const err = check.validate(value.trim());
      if (err) {
        if (check.level === "required") {
          result.errors.push(`${check.key}: ${err}`);
          result.ok = false;
        } else {
          result.warnings.push(`${check.key}: ${err}`);
        }
      }
    }
  }

  // Log to stderr so it appears in Vercel function logs
  if (result.missing.length > 0) {
    console.error("[WedBridge ENV] Missing required variables:\n" + result.missing.map((m) => `  - ${m}`).join("\n"));
  }
  if (result.errors.length > 0) {
    console.error("[WedBridge ENV] Invalid variable values:\n" + result.errors.map((e) => `  - ${e}`).join("\n"));
  }
  if (result.warnings.length > 0) {
    console.warn("[WedBridge ENV] Optional variables not set (some features disabled):\n" + result.warnings.map((w) => `  + ${w}`).join("\n"));
  }

  // Hard-fail in production
  if (!result.ok && process.env.NODE_ENV === "production") {
    throw new Error(
      `[WedBridge] Cannot start: ${result.missing.length} required environment variable(s) missing. ` +
      `Check .env.example for the full list.`,
    );
  }

  return result;
}

/**
 * Quick boolean helpers used throughout the app.
 */
export const envFlags = {
  get isFirebaseConfigured(): boolean {
    return Boolean(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    );
  },
  get isFirebaseAdminConfigured(): boolean {
    return Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
    );
  },
  get isRazorpayConfigured(): boolean {
    return Boolean(
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET,
    );
  },
  get isTelegramConfigured(): boolean {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN);
  },
  get isGeminiConfigured(): boolean {
    return Boolean(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    );
  },
};
