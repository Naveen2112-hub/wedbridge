import { NextRequest, NextResponse } from "next/server";
import { processAdminQuery } from "@/lib/ai/adminAssistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json() as { message: string };
    if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });
    const response = await processAdminQuery(message);
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Admin query failed" },
      { status: 500 },
    );
  }
}
