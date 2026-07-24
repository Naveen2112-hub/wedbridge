import { NextRequest, NextResponse } from "next/server";
import { getImportById } from "@/lib/ocr/biodataImport";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const userDoc = await db.collection("users").doc(user.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const record = await getImportById(id);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ import: record });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch import" },
      { status: 500 },
    );
  }
}
