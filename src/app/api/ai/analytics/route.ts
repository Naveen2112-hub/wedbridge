import { NextResponse } from "next/server";
import { getDashboardAnalytics } from "@/lib/ai/analyticsService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const analytics = await getDashboardAnalytics();
    return NextResponse.json(analytics);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
