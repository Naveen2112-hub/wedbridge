import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { getMembership } from "@/lib/membership-service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const membership = await getMembership(user.uid);
    return NextResponse.json({ membership });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load membership";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
