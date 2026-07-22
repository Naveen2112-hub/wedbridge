import { NextRequest, NextResponse } from "next/server";
import { getImports, type ImportStatus } from "@/lib/ocr/biodataImport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
