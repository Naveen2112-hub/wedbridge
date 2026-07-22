import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/deployment/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = getHealthStatus();
  return NextResponse.json({
    status: status.healthy ? "healthy" : "degraded",
    uptime: status.uptime,
    errors: status.errors,
    warnings: status.warnings,
    timestamp: new Date().toISOString(),
  }, { status: status.healthy ? 200 : 503 });
}
