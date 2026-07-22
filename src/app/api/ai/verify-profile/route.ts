import { NextRequest, NextResponse } from "next/server";
import { verifyProfilePhoto } from "@/lib/ai/profileVerification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { photoURL, userId } = await req.json() as { photoURL: string; userId: string };
    if (!photoURL || !userId) {
      return NextResponse.json({ error: "photoURL and userId are required" }, { status: 400 });
    }
    const result = await verifyProfilePhoto(photoURL, userId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verification failed" },
      { status: 500 },
    );
  }
}
