import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { getInvoicesByUser, getInvoice } from "@/lib/membership/invoiceService";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const invoiceNumber = searchParams.get("invoiceNumber");

  if (invoiceNumber) {
    const invoice = await getInvoice(invoiceNumber);
    if (!invoice || invoice.uid !== user.uid) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  }

  const invoices = await getInvoicesByUser(user.uid);
  return NextResponse.json({ invoices });
}
