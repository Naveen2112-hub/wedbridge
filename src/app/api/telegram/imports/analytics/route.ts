import { NextResponse } from "next/server";
import { getOcrAnalytics } from "@/lib/ocr/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const analytics = await getOcrAnalytics();
    return NextResponse.json(analytics);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
