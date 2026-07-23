import type { Metadata } from "next";
import { RefundClient } from "@/components/info/RefundClient";

export const metadata: Metadata = {
  title: "Refund Policy — WedBridge",
  description: "WedBridge membership refund and cancellation policy.",
};

export default function RefundPage() {
  return <RefundClient />;
}
