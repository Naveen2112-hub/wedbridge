import { NextRequest, NextResponse } from "next/server";
import { parseSearchQuery } from "@/lib/ai/searchAssistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json() as { query: string };
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    const result = parseSearchQuery(query);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to parse query" },
      { status: 500 },
    );
  }
}
