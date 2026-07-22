import { NextRequest, NextResponse } from "next/server";
import { updateImportStatus, type ImportStatus } from "@/lib/ocr/biodataImport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { importId, action, reviewedBy } = body as {
      importId: string;
      action: "approve" | "reject";
      reviewedBy: string;
    };

    if (!importId || !action) {
      return NextResponse.json({ error: "importId and action are required" }, { status: 400 });
    }

    const status: ImportStatus = action === "approve" ? "approved" : "rejected";
    await updateImportStatus(importId, status, reviewedBy ?? "admin");

    return NextResponse.json({ ok: true, status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update import" },
      { status: 500 },
    );
  }
}
