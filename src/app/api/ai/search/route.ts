import { NextRequest, NextResponse } from "next/server";
import { parseSearchQuery } from "@/lib/ai/searchAssistant";
import { getAuthUser } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { query } = await req.json() as { query: string };
    if (!query || typeof query !== "string" || query.length > 500) {
      return NextResponse.json({ error: "Query is required (max 500 chars)" }, { status: 400 });
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
