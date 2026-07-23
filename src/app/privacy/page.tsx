import type { Metadata } from "next";
import { PrivacyClient } from "@/components/info/PrivacyClient";

export const metadata: Metadata = { title: "Privacy Policy — WedBridge", description: "Privacy policy." };

export default function PrivacyPage() { return <PrivacyClient />; }
