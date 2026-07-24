import { NextRequest, NextResponse } from "next/server";
import { getImports, type ImportStatus } from "@/lib/ocr/biodataImport";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const userDoc = await db.collection("users").doc(user.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as ImportStatus | null;

  try {
    const imports = await getImports(status ?? undefined);
    return NextResponse.json({ imports });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch imports" },
      { status: 500 },
    );
  }
}
