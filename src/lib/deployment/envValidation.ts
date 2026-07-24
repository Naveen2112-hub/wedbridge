/**
 * Environment validation and deployment configuration.
 * Validates required env vars at startup and provides deployment helpers.
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const OPTIONAL_ENV_VARS = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "NEXT_PUBLIC_SITE_URL",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "UPI_VPA",
] as const;

/**
 * Validate environment variables at startup.
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL_ENV_VARS) {
    if (!process.env[key]) {
      warnings.push(`${key} not set - some features may be limited`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Get deployment info.
 */
export function getDeploymentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    isProduction: process.env.NODE_ENV === "production",
    isVercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    buildId: process.env.NEXT_BUILD_ID ?? "local",
  };
}

/**
 * Log startup info for monitoring.
 */
export function logStartup(): void {
  const validation = validateEnv();
  const info = getDeploymentInfo();

  console.log("=== WedBridge Startup ===");
  console.log(`Environment: ${info.nodeEnv}`);
  console.log(`Platform: ${info.isVercel ? "Vercel" : "Local"}`);

  if (validation.missing.length > 0) {
    console.error("Missing required env vars:", validation.missing.join(", "));
  }

  if (validation.warnings.length > 0) {
    console.warn("Optional env vars not set:", validation.warnings.join(", "));
  }

  if (validation.valid) {
    console.log("All required env vars present.");
  }

  console.log("==========================");
}
