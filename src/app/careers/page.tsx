import type { Metadata } from "next";
import { CareersClient } from "@/components/info/CareersClient";

export const metadata: Metadata = {
  title: "Careers — WedBridge",
  description: "Join the WedBridge team and help build Tamil Nadu's premier matrimony platform.",
};

export default function CareersPage() {
  return <CareersClient />;
}
