import type { Metadata } from "next";
import { PrivacyClient } from "@/components/info/PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy — WedBridge",
  description: "How WedBridge collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
