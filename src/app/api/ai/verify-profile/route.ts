import { NextRequest, NextResponse } from "next/server";
import { verifyProfilePhoto } from "@/lib/ai/profileVerification";
import { getAuthUser } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { photoURL } = await req.json() as { photoURL: string; userId?: string };
    if (!photoURL || typeof photoURL !== "string") {
      return NextResponse.json({ error: "photoURL is required" }, { status: 400 });
    }
    const result = await verifyProfilePhoto(photoURL, user.uid);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verification failed" },
      { status: 500 },
    );
  }
}
