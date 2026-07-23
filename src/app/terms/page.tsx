import type { Metadata } from "next";
import { TermsClient } from "@/components/info/TermsClient";

export const metadata: Metadata = {
  title: "Terms of Service — WedBridge",
  description: "Terms and conditions for using WedBridge.",
};

export default function TermsPage() {
  return <TermsClient />;
}
