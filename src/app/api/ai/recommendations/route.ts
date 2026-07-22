import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/ai/recommendationEngine";
import type { ProfileDocument } from "@/firebase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { uid, profile } = await req.json() as { uid: string; profile?: ProfileDocument };
    if (!uid) return NextResponse.json({ error: "uid is required" }, { status: 400 });
    const recs = await getRecommendations(uid, profile);
    return NextResponse.json({ recommendations: recs });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to get recommendations" },
      { status: 500 },
    );
  }
}
