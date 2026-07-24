import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/deployment/monitoring";
import { envFlags } from "@/lib/env/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = getHealthStatus();

  const capabilities = {
    firebase:     envFlags.isFirebaseConfigured,
    firebaseAdmin: envFlags.isFirebaseAdminConfigured,
    razorpay:     envFlags.isRazorpayConfigured,
    telegram:     envFlags.isTelegramConfigured,
    gemini:       envFlags.isGeminiConfigured,
  };

  const allCapabilitiesHealthy = Object.values(capabilities).every(Boolean);
  const overallHealthy = status.healthy;

  return NextResponse.json(
    {
      status: overallHealthy ? "healthy" : "degraded",
      version: process.env.NEXT_BUILD_ID ?? "dev",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      uptime: status.uptime,
      capabilities,
      issues: {
        errors:   status.errors,
        warnings: status.warnings,
      },
      timestamp: new Date().toISOString(),
    },
    { status: overallHealthy ? 200 : 503 },
  );
}
