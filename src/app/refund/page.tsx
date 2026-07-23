import type { Metadata } from "next";
import { RefundClient } from "@/components/info/RefundClient";

export const metadata: Metadata = { title: "Refund Policy — WedBridge", description: "Refund policy." };

export default function RefundPage() { return <RefundClient />; }
