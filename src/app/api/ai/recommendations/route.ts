import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/ai/recommendationEngine";
import { getAuthUser } from "@/lib/auth-server";
import type { ProfileDocument } from "@/firebase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { profile } = await req.json() as { uid?: string; profile?: ProfileDocument };
    const recs = await getRecommendations(user.uid, profile);
    return NextResponse.json({ recommendations: recs });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to get recommendations" },
      { status: 500 },
    );
  }
}
