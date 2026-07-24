import { NextRequest, NextResponse } from "next/server";
import { updateImportStatus, type ImportStatus } from "@/lib/ocr/biodataImport";
import { getAuthUser } from "@/lib/auth-server";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
    const body = await req.json();
    const { importId, action } = body as {
      importId: string;
      action: "approve" | "reject";
      reviewedBy?: string;
    };

    if (!importId || !action) {
      return NextResponse.json({ error: "importId and action are required" }, { status: 400 });
    }

    const status: ImportStatus = action === "approve" ? "approved" : "rejected";
    await updateImportStatus(importId, status, user.uid);

    return NextResponse.json({ ok: true, status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update import" },
      { status: 500 },
    );
  }
}
